# MitClimbingWallPollingScript
send an email with hours when mit bouldering wall hours change

This script runs in google scripts using a google sheet as a db, which means it is free to run with a gmail account

To Run:
1. Modify the email(s) in db.csv to be your recipient(s) email(s)
2. Save the attatched csv in google sheets
3. Modify BoulderingWallPoll.gs to reference your csv's sheet id from 2
4. Save BoulderingWallPoll.gs to google scripts
5. give your script Gmail API and Google Sheets API permissions (editing file => resources => advanced google services)
6. create a new trigger on BoulderingWallPoll.gs "run" function which runs every 5 minutes (editing file => edit => current project's triggers => add new trigger)
