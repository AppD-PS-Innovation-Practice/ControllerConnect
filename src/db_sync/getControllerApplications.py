# Script requires Requests Library 2.31.0 or later - https://requests.readthedocs.io/en/latest/
import argparse
import json
import logging
import requests
import subprocess
import sys
import psycopg2
from configparser import ConfigParser


def load_config(filename):

    parser = ConfigParser()
    parser.read(filename)
    section = 'postgresql'
    config = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            config[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))

    return config


def getAccessToken(account, client_name, client_secret):
    logging.info('Getting Access Token')
    response = requests.post(f"https://{account}.saas.appdynamics.com/controller/api/oauth/access_token",
                             headers={'Content-Type': 'application/x-www-form-urlencoded'},
                             data={'grant_type': 'client_credentials', 'client_id': f"{client_name}@{account}", 'client_secret': client_secret})
    # logging.info(f"response = {response}")
    access_token = response.json()['access_token']
    # logging.info(f"access_token = {access_token}")
    return access_token


def getResultFromApiWithAccessToken(account, endpoint, access_token):
    logging.info('Getting Application List - With API Client Token')
    response = requests.get(f"https://{account}.saas.appdynamics.com/{endpoint}", 
            headers={'Authorization': f"Bearer {access_token}"})
    # logging.info(f"response = {response}")
    # logging.info(response.text)
    return response.text


def main(loglevel, db_ini_filename):
    logging.basicConfig(
        format="%(asctime)s %(levelname)s %(message)s\n", level=loglevel)

    config = load_config(db_ini_filename)

    try:
        with psycopg2.connect(**config) as conn:

            application_list = []

            """
            collect new
            """
            with conn.cursor() as cur:
                cur.execute("SELECT controller, client_id, client_secret FROM controllers ORDER BY controller")
                print("The number of controllers: ", cur.rowcount)
                row = cur.fetchone()

                while row is not None:
                    logging.info(f'row is {row}')

                    appd_controller = row[0]
                    appd_clientname = row[1]
                    appd_clientsecret = row[2]
                    appd_endpoint = f'controller/rest/applications?output=JSON'

                    logging.info(f'appd_controller is {appd_controller}, '
                                f'appd_clientname is {appd_clientname}, '
                                f'appd_clientsecret is {appd_clientsecret}, '
                                f'appd_endpoint is {appd_endpoint}')

                    access_token = getAccessToken(appd_controller, appd_clientname, appd_clientsecret)
                    application_data = getResultFromApiWithAccessToken(appd_controller, appd_endpoint, access_token)
                    application_json = json.loads(application_data)
                    for app in application_json:
                        """
                        logging.info(f'{appd_controller} - '
                            f'{app["name"]} - '
                            f'{app["id"]} - '
                            f'{app["description"]}')
                        """
                        application_payload = json.dumps(
						    {
						    	"controller": appd_controller,
                                "name": app["name"],
						    	"id": app["id"],
						    	"description": app["description"]
                            })

                        logging.info(f'going to add insert application_payload: {application_payload}')
                        application_list.append(application_payload)

                    row = cur.fetchone()

            """
            clean out old
            """
            with conn.cursor() as cur:
                cur.execute("DELETE FROM applications")
                conn.commit()

            """
            replace with new
            """
            with conn.cursor() as cur:
                for app in application_list:
                    logging.info(f'app: {app}')
                    app_json = json.loads(app)
                    cur.execute("INSERT INTO applications (controller_name, app_name, app_id, app_desc) "
                                "VALUES ('%s', '%s', '%s', '%s')" % (app_json["controller"], app_json["name"], app_json["id"], app_json["description"]))
                    conn.commit()

    except Exception as error:
        logging.error(f'An exception occurred: {error}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('loglevel',
                        help='Logging level - mainly for debugging',
                        nargs='?',
                        default='ERROR', choices=['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'])
    parser.add_argument('db_ini_filename',
                        help='db_ini_filename',
                        nargs='?',
                        default='/appd/db.ini')
    args = parser.parse_args()
    # print(args)

    main(args.loglevel, args.db_ini_filename)
