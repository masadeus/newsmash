# newsmash
NewsMash shows where news take place, literally.
It integrates Google Maps with Google News with a MySQL database containing thousands of postal codes, GPS coordinates, and more.

![screen shot 2016-11-01 at 1 06 00 pm](https://cloud.githubusercontent.com/assets/16562886/19889455/451a112c-a035-11e6-93eb-a11aa68925e3.png)

In order to use it for your country use <i>bin/import.php</i>, a command-line script that takes the previosly downloaded and unzipped GeoNames file (http://download.geonames.org/export/zip/) that contains the ZIP codes and geographic relevant information.
It will parse it and insert the data into the previously created places table. To create the places MySQL DB follow the scheme provided in <i>bin/places.sql</i>.

To change the map style do so in the object array <i>style</i> in <i>public/js/scripts.js</i>.
Find further istructions in <i>https://developers.google.com/maps/documentation/javascript/styling</i>

Have fun!!
