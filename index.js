const inquirer = require("inquirer")
const mysql = require("mysql")
const cTable = require('console.table');
//establish connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'employee_db',
});



// Build a command-line application that at a minimum allows the user to:

//   * Add departments, roles, employees

//   * View departments, roles, employees

//   * Update employee roles

// Bonus points if you're able to:

//   * Update employee managers

//   * View employees by manager

//   * Delete departments, roles, and employees

//   * View the total utilized budget of a department -- ie the combined salaries of all employees in that department

//Only employees with managers :/
const findEmployeeSelector = `SELECT 
e.id, e.first_name, e.last_name, role.title, role.salary, department.name,
CONCAT(m.first_name, ' ', m.last_name) AS manager
from employee e
INNER JOIN role ON e.role_id = role.id
INNER JOIN department ON department.id = role.department_id
INNER JOIN employee m ON m.id = e.manager_id`


//view all managers
const findManagerSelector = `SELECT
 employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name
FROM employee_db.employee
INNER JOIN role ON employee.role_id = role.id
INNER JOIN department ON department.id = role.department_id
WHERE manager_id IS NULL`


const init = () => {
    inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'Select what you\'d like to do!',
        choices: ['View all Employees',
            'View all Employees by Deptartment',
            'View all Employees by Manager',
            'Add Employee',
            'Remove Employee',
            'Update Employee Role',
            'Update Employee Manager',
            'View all Roles',
            'Add role',
            'Update role',
            'Remove role',
            'View all departments',
            'Add department',
            'Update department',
            'Remove department',
            "Close"],
    }).then((answer) => {
        switch (answer.choice) {
            case 'View all Employees':
                viewAllEmployeesByParam('')
                break;
            case 'View all Employees by Deptartment':
                viewAllEmployeesByParam('department')
                break;
            case 'View all Employees by Manager':
                viewAllEmployeesByParam('manager')
                break;
            case 'Add Employee':
                messWithEmployeesByParam("add")
                break;
            case 'Remove Employee':
                messWithEmployeesByParam("remove")
                break;
            case 'Update Employee Role':
                messWithEmployeesByParam("update role")
                break;
            case 'Update Employee Manager':
                messWithEmployeesByParam("update manager")
                break;
            case 'View all Roles':
                messWithRolesByParam("view")
                break;
            case 'Add role':
                messWithRolesByParam("add")
                break;
            case 'Update role':
                messWithRolesByParam("update")
                break;
            case 'Remove role':
                messWithRolesByParam("remove")
                break;
            case 'View all departments':
                messWithDepartmentsByParam("view")
                break;
            case 'Add department':
                messWithDepartmentsByParam("add")
                break;
            case 'Update department':
                messWithDepartmentsByParam("update")
                break;
            case 'Remove department':
                messWithDepartmentsByParam("remove")
                break;
            default:
                break;
        }
    })
}

connection.connect(function (err) {
    if (err) throw err;
    init()
});

function messWithDepartmentsByParam(param) {
    if (param === "add") {
        inquirer.prompt([{
            type: 'input',
            name: 'name',
            message: "Please input the name of this new department",
        }
        ]).then((answer) => {
            connection.query(`INSERT INTO department(name)
        VALUES ("${answer.name}")`, function (err, results) {
                if (err) throw err;
                console.log(`${answer.name} was successfully added!`);
                init();
            });
        })
    } else if (param != "view") {
        let departmentArr = []
        let departmentObj = {}
        connection.query("SELECT * FROM employee_db.department;", function (err, res) {
            res.forEach(element => {
                departmentArr.push(element.name)
                departmentObj[element.name] = element.id
            });

            if (param === "remove") {
                inquirer.prompt(
                    {
                        type: 'list',
                        name: 'choice',
                        message: 'Select what department you want to remove.',
                        choices: departmentArr
                    }
                ).then((answer) => {
                    let departmentID = departmentObj[answer.choice]
                    connection.query("DELETE FROM department WHERE id = " + departmentID, function (err, res) {
                        if (err) throw err
                        console.log(answer.choice + " Successfully removed")
                        init();
                    })
                })

                //update
            } else {
                inquirer.prompt(
                    {
                        type: 'list',
                        name: 'choice',
                        message: 'Select what department you want to rename.',
                        choices: departmentArr
                    }
                ).then((answer) => {
                    let departmentID = departmentObj[answer.choice]
                    inquirer.prompt(
                        {
                            type: 'input',
                            name: 'name',
                            message: "Please input what you'd like to rename this department.",
                        }
                    ).then((answer) => {
                        connection.query(`UPDATE employee_db.department SET name="${answer.name}" WHERE id=${departmentID}`, function (err, res) {
                            if (err) throw err
                            console.log(answer.choice + " Successfully updated")
                            init();
                        })
                    })
                })
            }
        })

    } else {
        connection.query("SELECT * FROM employee_db.department;", function (err, res) {
            console.table(res)
            init()
        })
    }
}


function messWithEmployeesByParam(param) {
    if (param === "add") {
        //This is a series of queries and inquiries.
        //It's an absolute mess, don't worrry about it.
        //Essentially we first get roles that can be chosen from
        //Then based on those we know the department, so we can ask who their manager is
        //Then add them.
        //I dunno how to make queries not stomp on themselves, so here's this.
        let ourguy = {}
        let roles = []
        let rolesObj = {}
        let managers = []
        let managersObj = {}
        inquirer.prompt(
            [{
                type: 'input',
                name: 'first',
                message: "Please input the employee's first name.",
            },
            {
                type: 'input',
                name: 'last',
                message: "Please input the employee's last name.",
            }]
        ).then((answers) => {
            ourguy.first_name = answers.first
            ourguy.last_name = answers.last
            connection.query(`SELECT * FROM employee_db.role;`, function (err, result) {
                if (err) throw err;

                result.forEach(element => {
                    roles.push(element.title)
                    rolesObj[element.title] = [element.id, element.department_id]
                });

                inquirer.prompt({
                    type: 'list',
                    name: 'choice',
                    message: 'Select what role this employee has',
                    choices: roles
                }).then((answer) => {
                    ourguy.roleID = rolesObj[answer.choice][0]
                    ourguy.departmentID = rolesObj[answer.choice][1]

                    connection.query(findManagerSelector + "\nAND department_id = " + ourguy.departmentID, function (err, result) {
                        if (err) throw err;
                        managers.push("None")
                        result.forEach(element => {
                            managers.push(element.first_name + " " + element.last_name)
                            managersObj[element.first_name + " " + element.last_name] = element.id
                        });

                        inquirer.prompt({
                            type: 'list',
                            name: 'choice',
                            message: 'Select what manager this employee has',
                            choices: managers
                        }).then((answer) => {
                            if (answer.choice === "None") {
                                ourguy.manager = null
                            } else {
                                ourguy.manager = managersObj[answer.choice]
                            }

                            connection.query(`insert INTO EMPLOYEE(first_name, last_name, role_id, manager_id)
                            VALUES ("${ourguy.first_name}", "${ourguy.last_name}", ${ourguy.roleID}, ${ourguy.manager})`, function (err, results) {
                                if (err) throw err;
                                console.log(`${ourguy.first_name} ${ourguy.last_name} was successfully added!`);
                                init();
                                //Fall off the cliff of brackets now.
                            });
                        });
                    });
                });
            });
        });
    } else {
        employeeArray = [];
        employeeObj = {};
        connection.query(
            findEmployeeSelector,
            function (err, res) {
                res.forEach(element => {
                    employeeArray.push(element.first_name + " " + element.last_name)
                    employeeObj[element.first_name + " " + element.last_name] = element.id
                });
                switch (param) {
                    case "remove":
                        inquirer.prompt({
                            type: 'list',
                            name: 'choice',
                            message: 'Select what employee to remove',
                            choices: employeeArray
                        }).then((answer) => {
                            connection.query("DELETE FROM employee WHERE id = " + employeeObj[answer.choice], function (err, res) {
                                if (err) throw err
                                console.log(answer.choice + " Successfully deleted")
                            })
                        })
                        break;
                    case "update role":
                        let target;
                        let roles = []
                        let rolesObj = {}
                        inquirer.prompt({
                            type: 'list',
                            name: 'choice',
                            message: 'Select what employee to update the roll of',
                            choices: employeeArray
                        }).then((answer) => {
                            target = answer.choice
                            connection.query(`SELECT * FROM employee_db.role;`, function (err, result) {
                                if (err) throw err;

                                result.forEach(element => {
                                    roles.push(element.title)
                                    rolesObj[element.title] = element.id
                                });

                                inquirer.prompt({
                                    type: 'list',
                                    name: 'choice',
                                    message: 'Select what role this employee should have',
                                    choices: roles
                                }).then((answer) => {
                                    roleID = rolesObj[answer.choice]
                                    connection.query(`UPDATE employee_db.employee SET role_id=${roleID} WHERE id=${employeeObj[target]}`, function (err, result) {
                                        if (err) throw err;
                                        console.log("role successfully changed!")
                                        init()
                                    })
                                })
                            })
                        })
                        break;
                    case "update manager":
                        let target1;
                        let managers = []
                        let managerObj = {}
                        inquirer.prompt({
                            type: 'list',
                            name: 'choice',
                            message: 'Select what employee to update the roll of',
                            choices: employeeArray
                        }).then((answer) => {
                            target1 = answer.choice
                            connection.query(findManagerSelector, function (err, result) {
                                if (err) throw err;

                                result.forEach(element => {
                                    managers.push(element.first_name + " " + element.last_name)
                                    managerObj[element.first_name + " " + element.last_name] = element.id
                                });

                                inquirer.prompt({
                                    type: 'list',
                                    name: 'choice',
                                    message: 'Select what manager this employee should have',
                                    choices: managers
                                }).then((answer) => {
                                    roleID = managerObj[answer.choice]
                                    connection.query(`UPDATE employee_db.employee SET manager_id=${roleID} WHERE id=${employeeObj[target1]}`, function (err, result) {
                                        if (err) throw err;
                                        console.log("role successfully changed!")
                                        init()
                                    })
                                })
                            })
                        })
                        break;
                    default:
                        break;
                }
            })
    }
}

function messWithRolesByParam(param) {
    if (param === "add") {
        let departmentArr = []
        let departmentObj = {}
        connection.query("SELECT * FROM employee_db.department;", function (err, res) {
            res.forEach(element => {
                departmentArr.push(element.name)
                departmentObj[element.name] = element.id
            });
            inquirer.prompt(
                {
                    type: 'list',
                    name: 'choice',
                    message: 'Select what department you want to add this role to.',
                    choices: departmentArr
                }
            ).then((answer) => {
                let departmentID = departmentObj[answer.choice]
                inquirer.prompt(
                    [{
                        type: 'input',
                        name: 'title',
                        message: "Please input the title of this new role",
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: "Please input the salary of this new role",
                    }
                    ]
                ).then((answers) => {
                    connection.query(`insert INTO ROLE(title, salary, department_id)
                    VALUES ("${answers.title}", ${answers.salary}, ${departmentID})`, function (err, results) {
                        if (err) throw err;
                        console.log(`${answers.title} was successfully added!`);
                        init();
                    });

                })
            })
        })

    } else {
        switch (param) {
            case "update":
                roleArr = []
                roleObj = {}
                connection.query("SELECT * FROM employee_db.role;", function (err, res) {
                    res.forEach(element => {
                        roleArr.push(element.title)
                        roleObj[element.title] = element.id
                    });
                    inquirer.prompt([{
                        type: 'list',
                        name: 'choice',
                        message: 'Select what role you want to update',
                        choices: roleArr
                    }, {
                        type: 'list',
                        name: 'which',
                        message: 'Select what part of it you want to update',
                        choices: ["Title", "Salary", "Department"]
                    }
                    ]).then((answer) => {
                        let roleID = roleObj[answer.choice]
                        let bitToChange = answer.which

                        if (bitToChange != "Department") {
                            let field;
                            let changedTo;
                            if (bitToChange === "Title") {
                                field = "title"

                            } else {
                                field = "salary"
                            }
                            inquirer.prompt(
                                [{
                                    type: 'input',
                                    name: 'changedTo',
                                    message: "Please input what you want it changed to.",
                                }]
                            ).then((answer) => {
                                changedTo = answer.changedTo
                                if (bitToChange === "Title") { changedTo = "'" + changedTo + "'" }
                                connection.query(`UPDATE employee_db.role SET ${field}=${changedTo} WHERE id=${roleID}`, function (err, result) {
                                    if (err) throw err;
                                    console.log("role successfully updated!")
                                    init()
                                })
                            })
                        } else {
                            let departmentArr = []
                            let departmentObj = {}
                            connection.query("SELECT * FROM employee_db.department;", function (err, res) {
                                res.forEach(element => {
                                    departmentArr.push(element.name)
                                    departmentObj[element.name] = element.id
                                });
                                inquirer.prompt(
                                    {
                                        type: 'list',
                                        name: 'choice',
                                        message: 'Select what department you want to change this role too',
                                        choices: departmentArr
                                    }
                                ).then((answer) => {
                                    connection.query(`UPDATE employee_db.role SET department_id=${departmentObj[answer.choice]} WHERE id=${roleID}`, function (err, result) {
                                        if (err) throw err;
                                        console.log("role successfully updated!")
                                        init()
                                    })
                                })
                            })
                        }
                    })

                })
                break;
            case "remove":
                roleArr = []
                roleObj = {}
                connection.query("SELECT * FROM employee_db.role;", function (err, res) {
                    res.forEach(element => {
                        roleArr.push(element.title)
                        roleObj[element.title] = element.id
                    });
                    inquirer.prompt(
                        {
                            type: 'list',
                            name: 'choice',
                            message: 'Which role would you like to remove?',
                            choices: roleArr
                        }
                    ).then((answer) => {
                        connection.query("DELETE FROM role WHERE id = " + roleObj[answer.choice], function (err, res) {
                            if (err) throw err
                            console.log(answer.choice + " Successfully removed")
                            init();
                        })
                    })

                })
                break;
            default:
                connection.query("SELECT * FROM employee_db.role;", function (err, res) {
                    console.table(res)
                    init()
                })
                break;
        }

    }

}

// init()
function viewAllEmployeesByParam(param) {
    switch (param) {
        case 'department':
            //query
            connection.query("SELECT name FROM employee_db.department;", function (err, result) {
                if (err) throw err;
                //build an inquirer arr.
                let inquirerArr = []
                result.forEach(element => inquirerArr.push(element.name));

                inquirer.prompt({
                    type: 'list',
                    name: 'choice',
                    message: 'Select what department you want to see employees of',
                    choices: inquirerArr
                }).then((answer) => {
                    connection.query(
                        findEmployeeSelector + `\nWHERE department.name = ?`,
                        answer.choice,
                        function (err, res) {
                            console.table(res)
                            init()
                        })
                })
            });

            break;
        case 'manager':
            connection.query(findManagerSelector, function (err, result) {
                if (err) throw err;
                //build an inquirer arr.
                let inquirerArr = []
                result.forEach(element => inquirerArr.push(element.first_name + " " + element.last_name));
                // console.log(inquirerArr)
                inquirer.prompt({
                    type: 'list',
                    name: 'choice',
                    message: 'Select what manager you want to see employees of',
                    choices: inquirerArr
                }).then((answer) => {
                    connection.query(
                        findEmployeeSelector + `\nWHERE CONCAT(m.first_name, ' ', m.last_name) = ?`,
                        answer.choice,
                        function (err, res) {
                            console.table(res)
                            init()
                        })
                })
            });
            break;
        default:
            connection.query(
                findEmployeeSelector,
                function (err, res) {
                    console.table(res)
                    init()
                })
            break;
    }

}

