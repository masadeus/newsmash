<?php

    require(__DIR__ . "/../includes/config.php");


    // TODO: search database for places matching $_GET["geo"]
    
    // El valor geo es passa desde la funció search al document scripts.js
    
    // parse_string
    $parameters = array_map('trim', explode(",", urldecode($_GET["geo"])));
    
    // build query
    $sql = "SELECT * FROM places WHERE ";
    
    if(count($parameters) == 1)
    {
        if(is_numeric($parameters[0]))
        {
            $sql .= 'postal_code LIKE "' . $parameters[0] . '%"'; 
        }
        else if(strlen($parameters[0]) == 2)
        {
            $sql .= 'admin_code1 LIKE "'  . $parameters[0] . '%"';
        }    
        else
        {
            $sql .= '(admin_name1 LIKE "'. $parameters[0] . '%" OR '
                 . 'place_name LIKE "'. $parameters[0] . '%" OR '
                 . 'admin_code1 LIKE "'  . $parameters[0] . '%")';
        }
    }
    else if(count($parameters) > 1)
    {
        for($i = 0, $count = count($parameters) ; $i < $count ; $i++)
        {
            if(is_numeric($parameters[$i]))
            {
                $sql .= 'postal_code LIKE "' . $parameters[$i] . '%"'; 
            }    
            else if(strlen($parameters[$i]) == 2)
            {
                $sql .= 'admin_code1 LIKE "'  . $parameters[$i] . '%"';
            }
            else
            {
                $sql .= '(admin_name1 LIKE "'. $parameters[$i] . '%" OR '
                     . 'place_name LIKE "'. $parameters[$i] . '%")';
            }
            
            if($i < $count - 1)
                $sql .= " AND ";
        }
    }
    
    // make the query
    $places = query($sql);
    
    // output places as JSON (pretty-printed for debugging convenience)
    header("Content-type: application/json");
    print(json_encode($places, JSON_PRETTY_PRINT));

?>
