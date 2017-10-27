var svrs = [
{name:'印度', ip:'10.198.20.221', db:'smartmgr', user:'super', pwd:'hentre2012!'},
];
for (var svrIndex = 0; svrIndex < svrs.length; svrIndex++){
var svr = svrs[svrIndex];

print('server: ' + svr.name + ' / ' + svr.ip);
var conn = new Mongo(svr.ip);
var db = conn.getDB('admin');  //选择数据库
db.auth(svr.user,svr.pwd);  //用户验证
db = conn.getDB(svr.db);  //选择数据库
db.getMongo().forceReadMode("legacy");
print('database: ' + svr.db);

//创建库
var his = conn.getDB('history');
var hisColCount = his.getCollectionNames().length;
var cols = db.getCollectionNames();
if (hisColCount == 0){
	his.test.save({name:'create database'});
	his.test.drop();
	db = conn.getDB('admin')
	db.runCommand({enableSharding:"history"});
	his.createUser( {"user" : svr.user,
					"pwd": svr.pwd,
					"roles" : [{ role: "dbOwner", db: "history" }]
					},{ w: "majority" , wtimeout: 5000});
	for (var i = 0; i < cols.length; i++){
		var col = cols[i];
		his.getCollection(col).save({name:'test'});
		db.runCommand({shardcollection: 'history.' + col, key: { _id:1 }});
		his.getCollection(col).remove({name:'test'});
		print('A - sharding history:' + col);
	}
	db = conn.getDB(svr.db)
	print('ensure history database');
}else{
	db = conn.getDB('admin')
	db.runCommand({enableSharding:"history"});
	for (var i = 0; i < cols.length; i++){
		var col = cols[i];
		db.runCommand({shardcollection: 'history.' + col, key: { _id:1 }});
		print('B - sharding history:' + col);
	}
	db = conn.getDB(svr.db)
}

//康之源更新
if (svr.name == '康之源' || svr.name == '汉拓云'){
	var before = ((new Date()).getTime() - (181 * 24 * 60 * 60 * 1000)) + '000000';
	var items = db.payment.find({_id:{$lt:NumberLong(before)}}).limit(100).toArray();
	while(items.length > 0){
		his.payment.insertMany(items);
		var ids = [];
		for (var i = 0; i < items.length; i++)
			ids.push(items[i]._id);
		items = [];
		db.payment.remove({_id: {$in: ids}});
		items = db.payment.find({_id:{$lt:NumberLong(before)}}).limit(100).toArray();
	}
	
	var before = ((new Date()).getTime() - (91 * 24 * 60 * 60 * 1000)) + '000000';
	items = db.deviceBilling.find({_id:{$lt:NumberLong(before)}}).limit(100).toArray();
	while(items.length > 0){
		his.deviceBilling.insertMany(items);
		var ids = [];
		for (var i = 0; i < items.length; i++)
			ids.push(items[i]._id);
		items = [];
		db.deviceBilling.remove({_id: {$in: ids}});
		items = db.deviceBilling.find({_id:{$lt:NumberLong(before)}}).limit(100).toArray();
	}
}

//更新KB的结构体
var DEF_FILTER_KEYS= {
    rodPPC: 'PP棉',
    rodRESIN: '树脂滤芯',
    rodC: '颗粒炭',
    rodCC: '烧结炭',
    rodKDF: 'KDF滤芯',
    rodUF: '超滤膜',
    rodCF: '复合滤芯',
    rodRO: 'RO膜',
    rodNA: '纳滤膜',
    rodT33: '口感炭'
};
var getFilterCalculationMode = function(key){
	switch (key){
		case 'rodRO':
		case 'rodNA':
		case 'rodT33':
			return NumberInt(98);
	}
	return NumberInt(99);
}
db.device.createIndex({'extInfo.matchBrand':1,'extInfo.matchVer':1},{name:'ix_dev_bv'});
var cursor = db.waterPurifierKnowledge.find({type: 8},{args:1, brand:1, ver:1, wasteRate:1});
while(cursor.hasNext()){
    var r = cursor.next();
	var updated = false;
	for (var i = 0; i < r.args.length; i++){
		var arg = r.args[i];
		if (arg.alias == null || arg.alias == ''){
			arg.alias = DEF_FILTER_KEYS[arg.key];
			updated = true;
		}
		if (arg.mode == null){
			arg.mode = getFilterCalculationMode(arg.key);
			updated = true;
		}
	}
	if (updated){
		db.waterPurifierKnowledge.update(
			{_id: r._id},
			{$set: {args: r.args}},
			{multi: false});
		db.device.update(
			{'extInfo.matchBrand': r.brand, 'extInfo.matchVer': r.ver},
			{$set: {'extInfo.kbs': r.args, 'extInfo.rate': parseInt(r.wasteRate*100,10)/100}},
			{multi: true});
			
		print("update wpk: " + r.brand + '-' + r.ver);
	}
}
db.device.dropIndex('ix_dev_bv');

cursor = db.waterPurifier.find({type: 8},{args:1, name:1});
while(cursor.hasNext()){
    var r = cursor.next();
	var updated = false;
	for (var i = 0; i < r.args.length; i++){
		var arg = r.args[i];
		if (arg.alias == null || arg.alias == ''){
			arg.alias = DEF_FILTER_KEYS[arg.key];
			updated = true;
		}
		if (arg.mode == null){
			arg.mode = getFilterCalculationMode(arg.key);
			updated = true;
		}
	}
	if (updated){
		db.waterPurifier.update(
			{_id: r._id},
			{$set: {args: r.args}},
			{multi: false});
		print("update wp: " + r.name);
	}
}
var idxs = db.payment.getIndexes();
var matched = false;
for (var i = 0 ; i < idxs.length; i++){
	if (idxs[i].name == 'ix_pay_s'){
		matched = true;
		break;
	}
}

//清理不要的接口
db.func.update({_id:'10408'},{$pull:{intfs:'/csm/lst-pending'}}, {multi: false});
db.func.update({_id:'10408'},{$pull:{intfs:'/csm/view-pending'}}, {multi: false});
print('clean intfs')

if (!matched){
	db.payment.dropIndex('ix_pay_uid');
	db.payment.dropIndex('ix_pay_pend');
	db.payment.dropIndex('ix_pay_cs');
	db.payment.dropIndex('ix_pay_s');
	db.payment.dropIndex('ix_rfc_eid');
	db.payment.dropIndex('ix_rfc_activetime');
	print('ensure indexes');
}

//更新GLOBALSETTING
//db.globalSetting.update({_id:"ADMINISTRATOR", contCost: null},{$set:{"contCost" : 1.5,"statSeed" : 1.0}},{multi: false})
//增加功能点
var items = [{ 
    "_id" : "08002", 
    "_class" : "com.hentre.smartmgr.entities.db.Func", 
    "name" : "全局数据统计接口", 
    "seq" : NumberLong(0), 
    "status" : NumberInt(1), 
    "createTime" : ISODate("2016-03-25T17:45:21.741+0800"), 
    "url" : "#", 
    "type" : NumberInt(1), 
    "pid" : "08000", 
    "intfs" : [
        "/schedule/collect", 
    ]
},{ 
    "_id" : "90012", 
    "_class" : "com.hentre.smartmgr.entities.db.Func", 
    "pid" : "90000", 
    "name" : "设备用水量统计", 
    "seq" : NumberLong(0), 
    "status" : NumberInt(1), 
    "createTime" : ISODate("2016-12-28T13:46:17.419+0800"), 
    "url" : "../rpt/dev_spend.html", 
    "type" : NumberInt(0), 
    "intfs" : [
        "/rpt/dev/spend-rpt", 
        "/ep/names"
    ]
}];
var funcIds = [];
for (var i = 0; i < items.length; i++){
	db.func.save(items[i]);
	//funcIds.push(items[i]._id);
	print('save func: ' + items[i].name);
}

//db.role.update({_id:"ADMINISTRATOR"},{$set:{resources: funcIds}},{multi: false});

//更新微信
//关闭无OWNER的设备日志
/*
var cursor = db.deviceLog.find({type:4, 'data.status': {$ne:2}},{did:1,msg:1,data:1});
var now = new Date();
while(cursor.hasNext()){
    var r = cursor.next();
	if (db.device.find({_id: r.did, owner: {$in:[null,'']}}).count() == 1){
		if (r.brk != null)
			db.breakPoint.remove({_id: r.brk});
		db.deviceLog.update(
			{_id: r._id},
			{$set: {
				'data.status': NumberInt(2),
				'data.updateTime': now,
			msg: r.msg + '\n\n【备注】用户删除设备，自动关闭\n更新于' + now.toString()}},
			{multi: false});
		print('close log for ' + r.did + ', log id is ' + r._id);
	}
}
*/

//更新角色
//这个是用于更新角色表权限的，要MICHAEL将上次加的两个报表FUNCTION ID填在cond2的位置，每段代码只能填1个ID
//然后COPY这段代码，再将另1个ID加上
//运行后具备ADMINISTRATOR权限的帐户将可以看到MICHAEL做的那两个报表
//同时需要将FUNCTION表与云端同步
cursor = db.role.find({type:0},{resources:1});
while(cursor.hasNext()){
    var r = cursor.next();
	if (r.resources == null || r.resources.length == 0)
		continue;
	//有此项则更新FUNCS项
	var funcs = {
		'08002':'08001',
		'90012':'90000',
	};
	for (var key in funcs){
		var cond1 = funcs[key];
		var cond2 = key;
		for (var i = 0; i < r.resources.length; i++){
			if (r.resources[i] == cond1)
				cond1 = null;
			else if (r.resources[i] == cond2)
				cond2 = null;
		}
		if (cond1 == null && cond2 != null){
			r.resources.push(cond2);
			db.role.update({'_id': r._id},{$set: {'resources': r.resources}},{multi: false});
			print('role - ' + r._id + ', func - ' + cond2);
		}
	}
}

//表分片
//db = conn.getDB('admin');
//db.runCommand({shardcollection: "smartmgr.DayWater", key: { _id: 1}});
print('----------------- completed -----------------\n');
}