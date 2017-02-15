<?php 

function getIps() 
{
 if(getenv('HTTP_CLIENT_IP') && strcasecmp(getenv('HTTP_CLIENT_IP'), 'unknown'))
 {
  $IP = getenv('HTTP_CLIENT_IP');
 } elseif(getenv('HTTP_X_FORWARDED_FOR') && strcasecmp(getenv('HTTP_X_FORWARDED_FOR'), 'unknown')) {
  $IP = getenv('HTTP_X_FORWARDED_FOR');
 } elseif(getenv('REMOTE_ADDR') && strcasecmp(getenv('REMOTE_ADDR'), 'unknown')) {
  $IP = getenv('REMOTE_ADDR');
 } elseif(isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], 'unknown')) {
  $IP = $_SERVER['REMOTE_ADDR'];
 }
 return $IP ? $IP : "unknow";
}

if (isset($_POST['Submit'])) {
 if (!empty($_FILES['upload']['name'])) {
        $ch = curl_init();
        $localfile = $_FILES['upload']['tmp_name'];
        $fp = fopen($localfile, 'r');
        curl_setopt($ch, CURLOPT_URL, 'ftp://ftp_login:password@ftp.domain.com/'.$_FILES['upload']['name']);
        curl_setopt($ch, CURLOPT_UPLOAD, 1);
        curl_setopt($ch, CURLOPT_INFILE, $fp);
        curl_setopt($ch, CURLOPT_INFILESIZE, filesize($localfile));
        curl_exec ($ch);
        $error_no = curl_errno($ch);
        curl_close ($ch);
        if ($error_no == 0) {
                $error = 'File uploaded succesfully.';
        } else {
                $error = 'File upload error.';
        }
 } else {
        $error = 'Please select a file.';
 }
}



echo 'computer os name is : ' . gethostname(); 
echo '<p>';
echo 'visiter username is : ' . php_uname('n'); 
echo '<p>';
echo 'URL host is : ' . $_SERVER['SERVER_NAME'];  
echo '<p>';
echo 'client IP is : ' . getIps();
echo '<p>';
echo 'remote addr is ' . $_SERVER['REMOTE_ADDR'];
echo '<p>';
echo 'x-forwarded-for is ' . $_SERVER['HTTP_X_FORWARDED_FOR'];
phpinfo();
 ?>

