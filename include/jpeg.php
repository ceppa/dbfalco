<?
function resize($sourcefile, $endfile, $thumbwidth, $thumbheight, $quality)
{
	$img = imagecreatefromjpeg($sourcefile);
	$width = imagesx( $img );
	$height = imagesy( $img );

	if ($width > $height) 
	{
	    $newwidth = $thumbwidth;
	    $divisor = $width / $thumbwidth;
	    $newheight = floor( $height / $divisor);
	}
	else 
	{
	    $newheight = $thumbheight;
	    $divisor = $height / $thumbheight;
	    $newwidth = floor( $width / $divisor );
	}
	$tmpimg = imagecreatetruecolor( $newwidth, $newheight );
	imagecopyresampled( $tmpimg, $img, 0, 0, 0, 0, $newwidth, $newheight, $width, $height );
	imagejpeg( $tmpimg, $endfile, $quality);
	imagedestroy($tmpimg);
	imagedestroy($img);
	return true;
}
?>
