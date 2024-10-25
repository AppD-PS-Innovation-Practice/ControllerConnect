# ControllerConnect
Portal to search multiple controllers application list in AppDynamics

This solution is made up of 3 Docker containers:

1. UI - NodeJS web application
	Users can search for application across controllers that have been added to the ControllerConnect data store
	Admin users can also configure tracked controllers as well as admin users
2. DB - Postgres database
	3 tables
		1. controllers
		2. applications
		3. admin
3. CRON - scheduled task running python script
	every 15 minutes, python script makes API requests to configured controllers 
	to update latest list of applications belonging to tracked controllers

## NodeJS UI Prerequisites ##

1. make sure node is installed and python and docker engine exists and is running
2. clone this repo
3. go into src/ui folder and run 'npm install'
4. then at root of project you can run python3 startup_test_env.py

## CRON Python Prerequisites ##

For each controller to be tracked, create client id and note client secret as follows:

1. Login to controller with administrator access
2. Click on Administration option in top right menu
3. Select API Clients in top menu
4. Click on the + to Create an API Client
5. Add Client Name, and click Generate Secret to populate Client Secret.  Save this value.
6. Add Administrator Role
7. Save the API Client

## UI Admin Configuration ##

1. Admin users login to ControllerConnect
2. Admin users have the option to manage controllers to be tracked - see Prerequisites for steps to obtain required controller API client details.
3. Admin users also have the option to manage admin users

## High Level Script Overview ##

1. Cron job will run Python script every 15 minutes, which will populate database table of applications with applications belonging to tracked controllers
2. Users can enter search terms to look for applications in application database table
3. Returned search results will have controller name, application name, and link to application

## Support ##

[GitHub]: https://github.com/AppD-PS-Innovation-Practice/ControllerConnect


