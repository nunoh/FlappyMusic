<?php
	$name  = $_POST["name"];
	$score = $_POST["score"];
	$date  = $_POST["date"];

	$f = 'history.txt';
	$contents = file_get_contents($f);
	$line = $name . "\t" . $score . "\t" . $date;
	$contents .= $line . "\n";
	file_put_contents($f, $contents);

	$f_scores = 'scores.txt'
	$contents
?>
