<?php

    require(__DIR__ . "/../includes/config.php");
    
    // ensure correct usage
    if (count($argv) !== 2)
        {
            echo "Please type: ./import /path/to/file.txt\n";
        }
        
    $path = $argv[1];
    
    // if file exists and it is readablelaunch import
    if (is_readable($path))
        import($path);
        
    else
        echo "File does not exist or is not readable.\n";
    
    function import($path)
    {
        // open US.txt // $handler is the resource which points to the path
        if(($handler = fopen($path, "r")) !== FALSE)
        {
            // fill DB
            while(($places = fgetcsv($handler, 0, "\t")) !== FALSE)
            { 
                $inserted = query("INSERT INTO places 
                    (country_code, postal_code, place_name, admin_name1,
                    admin_code1, admin_name2, admin_code2, admin_name3, 
                    admin_code3, latitude, longitude, accuracy) 
                    VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ", 
                    $places[0], $places[1], $places[2], $places[3],
                    $places[4], $places[5], $places[6], $places[7],
                    $places[8], $places[9], $places[10], $places[11]);
            }
        }
        else
          trigger_error("Could not open file.", E_USER_ERROR);   
    }    

?>
