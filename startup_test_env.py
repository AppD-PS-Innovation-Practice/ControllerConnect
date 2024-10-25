import os
import shutil
import time
import argparse
# Initialize the parser
parser = argparse.ArgumentParser(description='Process some command line arguments.')
# Add the --dbclean argument
parser.add_argument('--dbclean', action='store_true', help='Clean the database')
# Parse the arguments
args = parser.parse_args()

#clean ui mount
os.chdir('./run_time')
os.system('docker compose down')
time.sleep(5)
os.chdir('..')

# Check if --dbclean is present
if args.dbclean:
    with os.scandir('./run_time/pg_data') as entries:
        for entry in entries:
            if entry.is_file():
                os.unlink(entry.path)
            else:
                shutil.rmtree(entry.path)
if not os.path.exists('./run_time/ui'):
    os.makedirs('./run_time/ui')
else:
    with os.scandir('./run_time/ui') as entries:
        for entry in entries:
            if entry.is_file():
                os.unlink(entry.path)
            else:
                shutil.rmtree(entry.path)

if os.path.exists('./run_time/db_sync'):
    shutil.rmtree('./run_time/db_sync')
time.sleep(10)
print('Copying src files to mount point')
shutil.copytree('./src/db_sync','./run_time/db_sync')
shutil.copy('./src/ui/package.json','./run_time/ui')
shutil.copy('./src/ui/package-lock.json','./run_time/ui')
shutil.copy('./src/ui/app.js', './run_time/ui')
shutil.copytree('./src/ui/bin','./run_time/ui/bin')
shutil.copytree('./src/ui/public','./run_time/ui/public')
shutil.copytree('./src/ui/routes','./run_time/ui/routes')
shutil.copytree('./src/ui/models','./run_time/ui/models')
shutil.copytree('./src/ui/views','./run_time/ui/views')
shutil.copytree('./src/ui/node_modules', './run_time/ui/node_modules')

print('Sleeping before doing docker compose with build...')
time.sleep(15)
#maybe force build
os.chdir('./run_time')
os.system('docker compose up --build --force-recreate')
