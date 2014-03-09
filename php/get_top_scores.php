<?php

	$NTOP = 10;

	function array_sort($array, $on, $order=SORT_ASC) {
		$new_array = array();
		$sortable_array = array();

		if (count($array) > 0) {
			foreach ($array as $k => $v) {
				if (is_array($v)) {
					foreach ($v as $k2 => $v2) {
						if ($k2 == $on) {
							$sortable_array[$k] = $v2;
						}
					}
				} else {
					$sortable_array[$k] = $v;
				}
			}

			switch ($order) {
				case SORT_ASC:
					asort($sortable_array);
				break;
				case SORT_DESC:
					arsort($sortable_array);
				break;
			}

			foreach ($sortable_array as $k => $v) {
				$new_array[$k] = $array[$k];
			}
		}

		return $new_array;
	}

	$f = '../txt/history.txt';
	$contents = file_get_contents($f);

	$lines = explode("\n", $contents);

	$dict = array();
	for ($i = 0; $i < count($lines)-1; $i++) {
		$elems = explode("\t", $lines[$i]);
		// $score = $elems[1];
		// print_r($elems);
		$arr = array(
			'name' => $elems[0],
			'score' => $elems[1],
			'date' => $elems[2]
		);
		array_push($dict, $arr);
	}

	$sorted = array_sort($dict, 'score', SORT_DESC);

	$top = array_slice($sorted, 0, 10);

	// make sure not to return any zero as an high score!
	for ($i = 0; $i < count($top); $i++) {
		if ($top[$i] != "0") {
			echo $top[$i]["name"] . " | " . $top[$i]["score"] . " | " . $top[$i]["date"];
			echo "<br>";
		}
	}

?>
