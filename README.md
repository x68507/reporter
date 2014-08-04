reporter
========

Framework for easily creating and accessing MSSQL/T-SQL &amp; MySQL reports on both desktop and mobile (mimicked after SSRS)

About
========
This package allows a user to very easily setup a robust reporting suite for extracting table data out of a MSSQL or MySQL database.  The framework runs off of PHP and stores the .sql files locally (no additional databases are needed to save search queries).  Since this is designed to get the information out to users as quickly as possible, there is no login/verificaiton; anyone that can access the PHP server can access any of the saved queries.  

Each time a query is run, it is validated on the server to prevent SQL injetion, only allowing SELECT statements to be run.

Install and Configure
========
Download and install a webserver & PHP server; XAMPP or WAMP for Windows or LAMP for OSX/Linux is a very good choice.  Copy this package to a subfolder inside your htdocs or www root director.  

1. Open the config.php file and modify the given variables to connect to your database
2. Open the sqlsrv.php file and change the _data-type_ attribute in the <html> tag to your support database type.  Currently the following databases are supported:
 * MySQL
 * MSSQL (note that you need to install the SQLSRV driver for this database located at http://www.microsoft.com/en-us/download/details.aspx?id=20098)
3. Open jscript.js file and change the password from variable to whatever you want the master password to be (like I said, this was not designed to keep people out of your database).


Support
========
This package was originally designed for T-SQL queries on a Windows Server 2008 (32 bit) using Windows 7 with the latest stable version of Chrome.  It has since been modified to accept any Windows Server or MySQL backend and the following client:

* Chrome
* Firefox
* Safari
* IE10> 

Query Syntax
========

