split --numeric-suffix=1 -l 12 newslist.li newslist.li.
for i in {01..05}; do
	tidy -q -utf8 -numeric -asxhtml --show-warnings no  --force-output y newsroom_$i.html 2>/dev/null  | sed -e 's/ xmlns.*=".*"//g' -e '/DOCTYPE/d' -e '/transitional/d' | xmlstarlet ed -d '//ul[@class="newsList"]' | xmlstarlet ed --subnode '//div[@class="locaArea"]' --type elem -n ul -v "LICANLIXML" | xmlstarlet ed --insert '//ul[text()="LICANLIXML"]' --type attr -n class -v newsList | sed 's/LICANLIXML/\n&\n/g' | sed "/LICANLIXML/{r newslist.li.$i
	d}" | xmlstarlet ed --insert '/html' --type attr -n xmlns -v "https://www.w3.org/1999/xhtml" > newsroom_$i.xhtml
done
