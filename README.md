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
 * MSSQL (note that you need to install the SQLSRV driver for this database located at http://www.microsoft.com/en-us/download/details.aspx?id=20098 or http://robsphp.blogspot.com/2012/06/unofficial-microsoft-sql-server-driver.html for PHP 5.5)
 
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
####Basic Queries & Variables
Reporter is designed to execture single, standalone queries against one database.  There are several example queries that sucessfully run on a Microsoft database using T-SQL.  Although you can write a simple select query such as 

    SELECT TOP 10 * FROM tbl_table WHERE column="value"

the usefulness of Reporter comes into play when you start linking tables together.  First, you can create user-defined variables by using `DECLARE` statements like:

    DECLARE @var varchar(60) SET @var = ''
    DECLARE @cb varchar(1) SET @cb = '1'

This will create two variables when the query is first selected, prompting the user for a value before actually executing the query.  Notice that the first `varchar` has a length of `60` while the second `varchar` has a length of `1`.  Any `varchar` greater than 1 will create a textbox input while a `varchar` equal to length `1` will create a checkbox.  Using `varchar(1)`, a checkbox with a default value of `''` or `'0'` will be *unchecked* while a default value of `'1'` will be *checked*.

####Linking Tables
You can link specific columns from one table so they can be used in a drill-down for another table that has a variable input simply by naming your column with a question mark (**!**).

**Query 1**
    
    DECLARE @part varchar(60) SET @var = ''
    SELECT TOP 10 '!part | PartNo',Description FROM tbl_parts WHERE colPart = '@part'
    
**QUERY 2**
    
    DECLARE @part varchat(60) SET @var = ''
    SELECT TOP 10 '!part | PartNo',OrderNo FROM tbl_orders WHERE colPart = '@part'

First, by using a piping symbol **|**, you can control the actual title of the column regardless of the variable being linked to (before the pipe is the variable name and after the pipe is the column name).  Next, by using the **!**, a magnifying glass appears in the column named *PartNo* and all queries that have **@part** as a variable will appear in a right-click contextmenu.  When a user right clicks and selects the query, it will automatically run that query with the selected variable.
