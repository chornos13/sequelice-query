# Sequelice-Query

Sequelice-Query is a helpers that simplify querying Sequelize from Query URL

## **Installation**
`$ npm install --save sequelice-query`


### Query String
Sequelice-Query read key `filtered` and `sorted` from URL Query for example:

`http://example.com?filtered=[{"id:":"firstName", "value":"john"}]&sorted=[{"id:":"id", "desc":true"}]`

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
optSorted | Object | optSorted options

lets say we have table and data like this for example:

**Departement**

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

##### #initValues
Access URL: `/departement`

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

so basically initValues is just initialization your condition if there's none filter condition request by user



##### #defaultValues
Access URL: `/departement`

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


##### #transformValue
function (args, cont)

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

cont //return this value if you want to continue to next function transformValue

```
Access URL: `/departement`

```javascript
const condition = await sQuery.generate({
    req,
    model: Departement,
    configs: {
        optFilter: {
            transformValue: [
                sQuery.Helpers.handlePrefix('between', (args, cont) => {
                    const { key, value } = args
                    if (key === 'Departement.id') {
                        const [from, to] = value
                        return sequelize.literal(
                            `${sQuery.Helpers.getColumnQueryKey(
                                key
                            )} between '${from}' and '${to}'`
                        )
                    }
                    /*
                       return cont value if you want to continue to next function transformValue,
                       if it's return undefined then it will no handle anything nor to next function transformValue
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


#### optSorted options and example

key | value
--- | --- 
initValues| object
defaultValues| object
transformValue| Function, Array Function
transformValueByKey| object
transformDesc| Function, Array Function

