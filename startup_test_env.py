import os
import shutil
import time
#clean ui mount
os.chdir('./run_time')
os.system('docker compose down')
time.sleep(5)
os.chdir('..')
with os.scandir('./run_time/ui') as entries:
    for entry in entries:
        if entry.is_file():
            os.unlink(entry.path)
        else:
            shutil.rmtree(entry.path)
time.sleep(10)
print('Copying src files to mount point')
shutil.copy('./src/ui/package.json','./run_time/ui')
shutil.copy('./src/ui/package-lock.json','./run_time/ui')
shutil.copy('./src/ui/app.js', './run_time/ui')
shutil.copytree('./src/ui/bin','./run_time/ui/bin')
shutil.copytree('./src/ui/public','./run_time/ui/public')
shutil.copytree('./src/ui/routes','./run_time/ui/routes')
shutil.copytree('./src/ui/views','./run_time/ui/views')
shutil.copytree('./src/ui/node_modules', './run_time/ui/node_modules')
print('Sleeping before doing docker compose with build...')
time.sleep(15)
#maybe force build
os.chdir('./run_time')
os.system('docker compose up --build --force-recreate')