
interface filter<T> {
    where: Partial<T>
    returning?: string[] | '*'
    set? : Partial<T> | T
}

export class QueryBuilder  {

    private _tableName: string


    private set setTableName(value: string) {
        this._tableName = value;
    }

    private get getTableName(){
        return this._tableName
    }

    private static makeInsertValuesSql<Entity>(insertedObject: Entity): any[]{

        const keys: string[] = Object.keys(insertedObject)
        const values = Object.values(insertedObject)
        const typeMap: Map<string, any> = this.generateTypeMap(insertedObject,keys)

        const valuePlaceholders = QueryBuilder.generateValuesPlaceholders(values)
        const valuesSQL = `values (${valuePlaceholders})`
        const typedValuesArray: (number | string)[] = QueryBuilder.generateTypedValuesArray(keys,typeMap,values)

        return [valuesSQL,typedValuesArray]

    }

    private static generateValuesPlaceholders(values: any[]){
        let placeholders = ''
        for(let i = 1; i < values.length + 1; i++){
            if(i !== values.length ) placeholders+=`$${i},`
            else placeholders+=`$${i}`

        }
        return placeholders
    }

    private static generateTypedValuesArray(keys: string[], typeMap: Map<string,any>,values: any){
        const output = []
        for(let i = 0; i < keys.length;i++){
            const key = keys[i]
            const value = values[i]
            const type = typeMap.get(key)
            let typedValue;
            switch (type){
                case 'number':{
                    typedValue = Number(value)
                    break
                }
                default: typedValue = value
            }
            output.push(typedValue)
        }
        return output
    }

    private static generateTypeMap(target: any, keys: string[]){
        const typeMap: Map<string, any> = new Map()
        keys.forEach(key => {
            const typeOfKey = typeof target[key]
            typeMap.set(key, typeOfKey)
        })
        return typeMap
    }

    private static generateAssignments(keys:string[],values: any,isForSet: boolean = false){
        let assignments:string[] = []
        for(let i = 0; i < values.length;i++){
            const key = keys[i]
            const value = values[i]
            let assignment;
            const separatorBasedOnIsForSet = isForSet ? ',' : 'and';
            if(values.length > 1 && i !== values.length - 1 && typeof value !== 'string') {
                assignment = `${key} = ${value}${separatorBasedOnIsForSet}`
            }
            else if(typeof value == 'string' && i !== values.length -1) {
                 assignment = `${key} = '${value}' ${separatorBasedOnIsForSet}`
            }
            else {
                if (typeof value != 'string') assignment = `${key} = ${value}`
                else assignment = `${key} = '${value}'`
            }
            assignments.push(assignment)
        }
        return assignments.join(' ')
    }

    public ofTable(tableName: string): QueryBuilder{
        const newQb = new QueryBuilder()
        newQb.setTableName = tableName
        return newQb
    }

    public insert<Entity>(insertedObject: Entity): (string | any)[]{
        console.log(insertedObject);
        const [valuesSQL,typedValuesArray] = QueryBuilder.makeInsertValuesSql<Entity>(insertedObject)
        const joinedKeysOfInsertedObject = Object.keys(insertedObject).join(',')
        const SQL = `insert into ${this.getTableName} (${joinedKeysOfInsertedObject}) ${valuesSQL}`
        return [SQL, typedValuesArray]
    }

    public select<Entity>(expression?: filter<Entity>){
        // expression:{where : {id:0, name:'artem'} }
        let sql;
        if(!expression) return `select * from ${this.getTableName}`
        const conditions = expression?.where
        const returning = expression?.returning


        const keys = Object.keys(conditions)
        const values = Object.values(conditions)

        const whereStatement = QueryBuilder.generateAssignments(keys,values, false)
        console.log(whereStatement);
        if(returning == '*'){
            sql = `select * from ${this.getTableName} where ${whereStatement}`

        }
        else if(Array.isArray(returning)){
            const returningValues = (returning as string[]).join(',')
            sql = `select ${returningValues} from ${this.getTableName} where ${whereStatement}`

        }
        else {
            sql = `select * from ${this.getTableName} where ${whereStatement}`
            console.log('here3');
        }

        return sql


    }

    public delete<Entity>(expression : Pick<filter<Entity>,'where'>){
        const conditions = expression.where

        const keys = Object.keys(conditions)
        const values = Object.values(conditions)

        const whereStatement = QueryBuilder.generateAssignments(keys,values)
        const sql = `delete from ${this.getTableName} where ${whereStatement}`

        return sql
    }

    public update<Entity>(expression: Partial<filter<Entity>>){

        const conditions = expression.where
        const whereKeys = Object.keys(conditions)
        const whereValues = Object.values(conditions)

        const whereStatement = QueryBuilder.generateAssignments(whereKeys,whereValues)

        const mapToUpdate = expression.set
        const keysToUpdate = Object.keys(mapToUpdate)
        const valuesToUpdate = Object.values(mapToUpdate)

        const setAssignmentStatement = QueryBuilder.generateAssignments(keysToUpdate,valuesToUpdate, true)

        const sql = `update ${this.getTableName} set ${setAssignmentStatement} where ${whereStatement}`

        return sql

    }

}

