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

# Generate Config

These are the available config options

key | value | description
--- | --- | ---
include | Array Object/Model | use as usual in the sequelize
optFilter | Object | optFilter options 
optSorted | Object | optSorted options

#### optFilter options

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



#### optSorted options

key | value
--- | --- 
initValues| object
defaultValues| object
transformValue| Function, Array Function
transformValueByKey| object
transformDesc| Function, Array Function

