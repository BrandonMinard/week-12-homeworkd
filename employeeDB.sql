DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;
USE employee_db;

-- * **department**:

--   * **id** - INT PRIMARY KEY
--   * **name** - VARCHAR(30) to hold department name

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
);


-- * **role**:

--   * **id** - INT PRIMARY KEY
--   * **title** -  VARCHAR(30) to hold role title
--   * **salary** -  DECIMAL to hold role salary
--   * **department_id** -  INT to hold reference to department role belongs to

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  department_id INT NOT NULL,
  PRIMARY KEY (id)
);


-- * **employee**:

--   * **id** - INT PRIMARY KEY
--   * **first_name** - VARCHAR(30) to hold employee first name
--   * **last_name** - VARCHAR(30) to hold employee last name
--   * **role_id** - INT to hold reference to role employee has
--   * **manager_id** - INT to hold reference to another employee that manages the employee being Created. This field may be null if the employee has no manager

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT,
  PRIMARY KEY (id)
);

INSERT INTO department(name)
VALUES ("Sales"), ("Marketing"), ("IT");
INSERT INTO role(title, salary, department_id)
VALUES ("Telemarketer", 20.0, 1), ("Ad Guy", 15.0, 2), ("IT Intern", 20.5, 3),
("Sales Professional", 40.5, 1), ("Marketing Coordinator", 47.5, 2), ("IT Overseer", 36.5, 3),
("Sales Executive", 70.5, 1), ("Marketing Executive", 100.5, 2), ("IT Professional Technician", 60.5, 3);



insert INTO EMPLOYEE(first_name, last_name, role_id, manager_id)
VALUES ("Silke", "Stefani", 4, null), ("Madyson", "Samuel", 5, null),
("Beat", "Janneke", 6, null), ("Ignatios", "Christin", 7, 1),
("Orfeas", "Serrena", 8, 2), ("Edelgard", "Jördis", 9, 3),
("Randolph", "Tycho", 1, 1), ("Jacqui", "Tatiana", 2, 2),("Ashlea", "Gavriil", 3, 3);