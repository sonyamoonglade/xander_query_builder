var User = /** @class */ (function () {
    function User(id, name, age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }
    return User;
}());
var QueryBuilder = /** @class */ (function () {
    function QueryBuilder() {
    }
    Object.defineProperty(QueryBuilder.prototype, "setTableName", {
        set: function (value) {
            this._tableName = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueryBuilder.prototype, "getTableName", {
        get: function () {
            return this._tableName;
        },
        enumerable: false,
        configurable: true
    });
    QueryBuilder.prototype.ofTable = function (tableName) {
        var newQb = new QueryBuilder();
        newQb.setTableName = tableName;
        return newQb;
    };
    QueryBuilder.makeInsertValuesSql = function (insertedObject) {
        var keys = Object.keys(insertedObject);
        var values = Object.values(insertedObject);
        var typeMap = this.generateTypeMap(insertedObject, keys);
        var valuePlaceholders = QueryBuilder.generateValuesPlaceholders(values);
        var valuesSQL = "values (".concat(valuePlaceholders, ")");
        var typedValuesArray = QueryBuilder.generateTypedValuesArray(keys, typeMap, values);
        return [valuesSQL, typedValuesArray];
    };
    QueryBuilder.generateValuesPlaceholders = function (values) {
        var placeholders = '';
        for (var i = 1; i < values.length + 1; i++) {
            if (i !== values.length)
                placeholders += "$".concat(i, ",");
            else
                placeholders += "$".concat(i);
        }
        return placeholders;
    };
    QueryBuilder.generateTypedValuesArray = function (keys, typeMap, values) {
        var output = [];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = values[i];
            var type = typeMap.get(key);
            var typedValue = void 0;
            switch (type) {
                case 'number': {
                    typedValue = Number(value);
                    break;
                }
                default: typedValue = value;
            }
            output.push(typedValue);
        }
        return output;
    };
    QueryBuilder.generateTypeMap = function (target, keys) {
        var typeMap = new Map();
        keys.forEach(function (key) {
            var typeOfKey = typeof target[key];
            typeMap.set(key, typeOfKey);
        });
        console.log(typeMap);
        return typeMap;
    };
    QueryBuilder.generateAssignments = function (keys, values, isForSet) {
        var assignments = [];
        for (var i = 0; i < values.length; i++) {
            var key = keys[i];
            var value = values[i];
            var assignment = void 0;
            var separatorBasedOnIsForSet = isForSet ? ',' : 'and';
            if (values.length > 1 && i !== values.length - 1 && typeof value !== 'string') {
                assignment = "".concat(key, " = ").concat(value).concat(separatorBasedOnIsForSet);
            }
            else if (typeof value == 'string') {
                assignment = "".concat(key, " = '").concat(value, "'").concat(isForSet && ',');
            }
            else {
                assignment = "".concat(key, " = ").concat(value);
            }
            assignments.push(assignment);
        }
        return assignments.join(' ');
    };
    QueryBuilder.prototype.insert = function (insertedObject) {
        var _a = QueryBuilder.makeInsertValuesSql(insertedObject), valuesSQL = _a[0], typedValuesArray = _a[1];
        var SQL = "insert into ".concat(this.getTableName, " ").concat(valuesSQL);
        return [SQL, typedValuesArray];
    };
    QueryBuilder.prototype.select = function (expression) {
        // expression:{where : {id:0, name:'artem'} }
        var conditions = expression.where;
        var returning = expression === null || expression === void 0 ? void 0 : expression.returning;
        var keys = Object.keys(conditions);
        var values = Object.values(conditions);
        var whereStatement = QueryBuilder.generateAssignments(keys, values);
        var sql;
        if (returning == '*') {
            sql = "select * from ".concat(this.getTableName, " where ").concat(whereStatement);
        }
        else if (Array.isArray(returning)) {
            var returningValues = returning.join(',');
            console.log(returningValues);
            sql = "select ".concat(returning, " from ").concat(this.getTableName, " where ").concat(whereStatement);
        }
        else {
            sql = "select * from ".concat(this.getTableName, " where ").concat(whereStatement);
        }
        return sql;
    };
    QueryBuilder.prototype["delete"] = function (expression) {
        var conditions = expression.where;
        var keys = Object.keys(conditions);
        var values = Object.values(conditions);
        var whereStatement = QueryBuilder.generateAssignments(keys, values);
        var sql = "delete from ".concat(this.getTableName, " where ").concat(whereStatement);
        return sql;
    };
    QueryBuilder.prototype.update = function (expression) {
        var conditions = expression.where;
        var whereKeys = Object.keys(conditions);
        var whereValues = Object.values(conditions);
        var whereStatement = QueryBuilder.generateAssignments(whereKeys, whereValues);
        var mapToUpdate = expression.set;
        var keysToUpdate = Object.keys(mapToUpdate);
        var valuesToUpdate = Object.values(mapToUpdate);
        var setAssignmentStatement = QueryBuilder.generateAssignments(keysToUpdate, valuesToUpdate, true);
        var sql = "update ".concat(this.getTableName, " set ").concat(setAssignmentStatement, " where ").concat(whereStatement);
        console.log(sql);
    };
    return QueryBuilder;
}());
var qb = new QueryBuilder();
var u1 = new User(0, 'artem', 15);
// const [sql,values] = qb.ofTable('users').insert<User>(u1)
// console.log(sql,values)
// const [sql,values] = qb.ofTable('users').insert<User>(u1)
// console.log(sql,values)
// select name from user where id = 0
// const sql = qb.ofTable('users').delete<User>({where:{age:15,name:'Artem'}})
// console.log(sql)
var Todo = /** @class */ (function () {
    function Todo(completed) {
        this.completed = completed;
    }
    return Todo;
}());
// const t1 = new Todo(false)
// const sql = qb.ofTable('todos').select<Todo>({where:{completed: true}})
var insertSql = qb.ofTable('todos').update({ where: { id: 0 }, set: u1 });
// console.log(insertSql)
