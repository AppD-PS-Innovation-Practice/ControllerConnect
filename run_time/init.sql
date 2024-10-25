
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
  user_pass varchar(250) NOT NULL,
  user_email varchar(250) NOT NULL
);


INSERT INTO admin (user_email, user_pass) VALUES ('admin@admin.com', '$2a$05$iEkIwNIrV0x2WetvzMWkWerPIeTkpwdtLq9eNUYr43Bh5JionaUy6');