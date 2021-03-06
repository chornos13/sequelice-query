# Sequelice-Query
[![npm version](https://img.shields.io/npm/v/sequelice-query.svg?style=flat-square)](https://www.npmjs.org/package/sequelice-query)
[![npm downloads](https://img.shields.io/npm/dm/sequelice-query.svg?style=flat-square)](http://npm-stat.com/charts.html?package=sequelice-query)

Sequelice-Query is a helpers that simplify querying Sequelize from Query URL

## **Installation**
`$ npm install --save sequelice-query`


### Query String
Sequelice-Query read key `filtered` and `sorted` from URL Query for example:

`http://example.com?filtered=[{"id":"firstName", "value":"john"}]&sorted=[{"id":"id", "desc":true}]`

both of them is JSON Stringify Array and it's contain object:

Key | Value | Object Key
--- | --- | ---
`filtered` | Array Object | id, value 
`sorted` | Array Object | id, desc 
 

```
filtered=[{ 
    "id": "firstName", // for column name
    "value": "john" // for value 
}]

sorted=[{
    "id": "id", // for column name
    "desc": true // boolean value true/false 
}]
```

## Quick Usage

```javascript
const models = require('../models')
const sQuery = require('sequelice-query')
const Departement = models.Departement

async function getDepartement(req, res) {
	const condition = await sQuery.generate({
		req,
		model: Departement,
	})

	const { include, queryFilter: where, querySort: order } = condition

	const data = await Departement.findAll({
		include,
		where,
		order,
	})

	return res.status(200).json({data})
}

```

## API

**.generate({req, model, configs})**
```
.generate({
req: object req express, 
model: Model, 
configs: object
})
```

```javascript
const sQuery = require('sequelice-query')
const models = require('../models')
const User = models.User
const Role = models.Role

async function getUser(req, res) {
  const condition = await sQuery.generate({
    req,
    model: User,
    configs: {
      include: [
        { model: Role }
      ],
      optFilter: {
        transformValue: [
            sQuery.Helpers.handlePrefix('between', (args) => {
                const { key, value } = args
                const [from, to] = value
                return sequelize.literal(
                    `${sQuery.Helpers.getColumnQueryKey(
                        key
                    )} between '${from}' and '${to}'`
                )
            }),
        ],
        customIncludeOptions: {
            ['Role']: {
                required: false,
            },
        },        
      }
    }
  }) 
}
```

# configs

These are the available config options

key | value | description
--- | --- | ---
include | Array Object/Model | use as usual in the sequelize
optFilter | Object | optFilter options 
optSort | Object | optSort options

lets say we have table and data like this for example:

`Departement`

id | name | createdAt | updatedAt 
--- | --- | --- | ---
1 | WiGen | 2019-08-24 20:09:04 | 2019-08-24 20:09:04
2 | Niku | 2019-08-24 20:14:57 | 2019-08-24 20:14:57
3 | Kuma | 2019-08-24 20:09:37 | 2019-08-24 20:09:40

#### optFilter options and example

key | value
--- | --- 
initValues| object
defaultValues| object
isSkipKey| function
customIncludeOptions| object
transformValue| Function, Array Function
transformValueByKey| object
transformKey| Function, Array Function
transformKeyByKey| object

#### #initValues: object
GET URL: `/departement`

```javascript
const condition = await sQuery.generate({
    req,
    model: Departement,
    configs: {
        optFilter: {
            initValues: {
                id: 1,
            },
        },
    },
})

const { include, queryFilter: where, querySort: order } = condition

const data = await Departement.findAll({
    include,
    where,
    order,
})

return data

/*
result
data: [
    {
        "id": 1,
        "name": "WiGen",
        "createdAt": "2019-08-24T20:09:04.000Z",
        "updatedAt": "2019-08-24T20:09:04.000Z"
    }
]
*/
```

so basically initValues is just initialization your condition if there's no filter condition request by user



#### #defaultValues: object
GET URL: `/departement`

```javascript
const condition = await sQuery.generate({
    req,
    model: Departement,
    configs: {
        optFilter: {
            defaultValues: {
                name: 'u',
            },
        },
    },
})

const { include, queryFilter: where, querySort: order } = condition

const data = await Departement.findAll({
    include,
    where,
    order,
})

return data

/*
result
"data": [
    {
        "id": 2,
        "name": "Niku",
        "createdAt": "2019-08-24T20:14:57.000Z",
        "updatedAt": "2019-08-24T20:14:57.000Z"
    },
    {
        "id": 3,
        "name": "Kuma",
        "createdAt": "2019-08-24T20:09:37.000Z",
        "updatedAt": "2019-08-24T20:09:40.000Z"
    }
]
*/
```

if no condition for `name` then the default values is `LIKE %u%`

#### #isSkipKey: function(args)

```javascript
const condition = await sQuery.generate({
    req,
    model: Departement,
    configs: {
        optFilter: {
            isSkipKey: (args) => {
                /*
                    { args:
                       { key: 'DepartementEmployees.id',
                         value: 5,
                         configs:
                          { isSkipKey: [Function: isSkipKey],
                            transformValue: [Array],
                            customIncludeOptions: [Object] },
                         include: [ [Object], [Object] ] } 
                    }
                */

                // return true to skip the key
                return true
            },
        },
    },
})
```

#### #customIncludeOptions: function(args)

```javascript
const condition = await sQuery.generate({
    req,
    model: Departement,
    configs: {
        include: [
            {
                model: DepartementEmployee,
                //customIncludeOptions will goes here
            }
        ],
        optFilter: {
            customIncludeOptions: {
                // Model name if its 1:M than use plural if 1:1 use singular name
                // or u can see from result data, what is properties name for that model
                ['DepartementEmployees']: args => {
                    /*
                        { args:
                             { configs:
                                    { transformValue: [Array],
                                        customIncludeOptions: [Object],
                                        transformKey: [Function: handleIncludeTransfromKey] },
                                 modelName: 'DepartementEmployees',
                                 modelPath: 'DepartementEmployees',
                                 model: DepartementEmployee,
                                 handledKeys: [ 'DepartementEmployees.id' ],
                                 filtered: [ [Object] ] }
                         }
                     */

                    // return custom obj include
                    return {
                        required: false,
                    }
                },
            },
        },
    },
})
```

#### #transformValue: array function (args, cont) | function (args, cont)

```javascript
args = {
    key: 'Departement.id',
    value: [ 1, 3 ], 
    configs: { ... }, //configs optFilter
    include: [], //include model
    model: Departement, // Model Object
    newKey: 'between$id', //generated from transformKeyByKey
    type: INTEGER //type column STRING/INTEGER/DATE .etc
}

/*
   return cont value if you want to continue to next function transformValue
   or handle by default,
   if it's return undefined then it will not handle anything nor 
   to next function transformValue
*/
cont 

```
GET URL: `/departement?filtered=[{"id":"between$id", "value":[2, 3]}]`

```javascript
const condition = await sQuery.generate({
    req,
    model: Departement,
    configs: {
        optFilter: {
            transformValue: [
                sQuery.Helpers.handlePrefix('between', (args, cont) => {
                    const { key, value } = args
                    // handle only with column 'Departement.id'
                    if (key === 'Departement.id') {
                        const [from, to] = value
                        return sequelize.literal(
                            `${sQuery.Helpers.getColumnQueryKey(
                                key
                            )} between '${from}' and '${to}'`
                        )
                    }
                    /*
                       return cont value if you want to continue to next function transformValue
                       or handle by default,
                       if it's return undefined then it will not handle anything nor 
                       to next function transformValue
                    */
                    return cont 
                }),
            ],
        },
    },
})

const { include, queryFilter: where, querySort: order } = condition

const data = await Departement.findAll({
    include,
    where,
    order,
})

return data

/*
result
"data": [
    {
        "id": 2,
        "name": "Niku",
        "createdAt": "2019-08-24T20:14:57.000Z",
        "updatedAt": "2019-08-24T20:14:57.000Z"
    },
    {
        "id": 3,
        "name": "Kuma",
        "createdAt": "2019-08-24T20:09:37.000Z",
        "updatedAt": "2019-08-24T20:09:40.000Z"
    }
]
*/
```

#### #transformValueByKey: object, `value: function (args, cont)`

GET URL: `/departement?filtered=[{"id":"between$id", "value":[2, 3]}]`

```javascript
const condition = await sQuery.generate({
    req,
    model: Departement,
    configs: {
        optFilter: {
            transformValueByKey: {
                ['between$id']: args => {
                    const { value } = args
                    const [from, to] = value
                    return sequelize.literal(
                        `${sQuery.Helpers.getColumnQueryKey(
                            'id'
                        )} between '${from}' and '${to}'`
                    )
                },
            },
        },
    },
})

const { include, queryFilter: where, querySort: order } = condition

const data = await Departement.findAll({
    include,
    where,
    order,
})

return data

/*
result
"data": [
    {
        "id": 2,
        "name": "Niku",
        "createdAt": "2019-08-24T20:14:57.000Z",
        "updatedAt": "2019-08-24T20:14:57.000Z"
    },
    {
        "id": 3,
        "name": "Kuma",
        "createdAt": "2019-08-24T20:09:37.000Z",
        "updatedAt": "2019-08-24T20:09:40.000Z"
    }
]
*/
```
it's same like transformValue but with spesific key

#### #transformKey: function (args, cont) | array function (args, cont)

```javascript
const condition = await sQuery.generate({
    req,
    model: Departement,
    configs: {
        optFilter: {
            transformKey: [
                (args, cont) => {
                    const { key } = args
                    if (key === 'between$id') {
                        return 'id'
                    }
                    /*
                        return cont to continue to next transformKey function
                        or to handle by default
                        if it's return undefined then it will not handle anything nor
                        to next function transformValue
                     */
                    return cont
                },
            ],
            transformValueByKey: {
                ['between$id']: args => {
                    const { newKey, value } = args // newKey is from transformKeyByKey
                    const [from, to] = value
                    return sequelize.literal(
                        `${sQuery.Helpers.getColumnQueryKey(
                            newKey
                        )} between '${from}' and '${to}'`
                    )
                },
            },
        },
    },
})

const { include, queryFilter: where, querySort: order } = condition

const data = await Departement.findAll({
    include,
    where,
    order,
})

return data
```


#### #transformKeyByKey: object, `value: function (args) | string`

```javascript
const condition = await sQuery.generate({
    req,
    model: Departement,
    configs: {
        optFilter: {
            transformKeyByKey: {
                ['between$id']: (args) => {
                    // args:
                    // { key: 'between$id',
                    // 	value: [ 2, 3 ],
                    // 	configs:
                    // 	{ transformKeyByKey: [Object], transformValueByKey: [Object] },
                    // 	include: [],
                    // 	model: Departement }
                    
                    // do whatever you want to transform key
                    return 'id'
                },
            },
            transformValueByKey: {
                ['between$id']: args => {
                    const { newKey, value } = args // newKey is from transformKeyByKey
                    const [from, to] = value
                    return sequelize.literal(
                        `${sQuery.Helpers.getColumnQueryKey(
                            newKey
                        )} between '${from}' and '${to}'`
                    )
                },
            },
        },
    },
})
```

```javascript
//or simply just passing string
transformKeyByKey: {
    ['between$id']: 'id',
}
```

#### optSort options and example

key | value
--- | --- 
initValues| object
defaultValues| object
transformValue| Function, Array Function
transformValueByKey| object
transformDesc| Function, Array Function

