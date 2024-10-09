
CREATE TABLE IF NOT EXISTS controllers (
  id SERIAL PRIMARY KEY,
  controller_name varchar(250) NOT NULL,
  client_id varchar(250) NOT NULL,
  client_secret varchar(250) NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  controller_name varchar(250) NOT NULL,
  app_name varchar(250) NOT NULL,
  app_id varchar(250) NOT NULL,
  app_desc varchar(250)
);

CREATE TABLE IF NOT EXISTS admin (
  id SERIAL PRIMARY KEY,
  user_id varchar(250) NOT NULL,
  user_pass varchar(250) NOT NULL,
  user_email varchar(250) NOT NULL
);

INSERT INTO controllers (controller_name, client_id, client_secret) VALUES ('appdynamicsinc-non-prod', 'singlepane', 'dcd1f726-b4ec-4986-98d3-8866f26a038e');
INSERT INTO controllers (controller_name, client_id, client_secret) VALUES ('amer-ps-sandbox', 'singlepane', 'a6437b8b-e431-415e-a1c2-8e1f8ec68bad');