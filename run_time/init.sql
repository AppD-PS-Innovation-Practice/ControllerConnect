
CREATE TABLE IF NOT EXISTS controllers (
  id INT NOT NULL,
  controller_name varchar(250) NOT NULL,
  client_id varchar(250) NOT NULL,
  client_secret varchar(250) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS applications (
  id INT NOT NULL,
  controller_name varchar(250) NOT NULL,
  app_name varchar(250) NOT NULL,
  app_id varchar(250) NOT NULL,
  app_desc varchar(250),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS admin (
  id INT NOT NULL,
  user_id varchar(250) NOT NULL,
  user_pass varchar(250) NOT NULL,
  user_email varchar(250) NOT NULL,
  PRIMARY KEY (id)
);