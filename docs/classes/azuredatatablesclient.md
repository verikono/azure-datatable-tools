[verikono-azure-datatable-tools](../README.md) / [Exports](../modules.md) / AzureDataTablesClient

# Class: AzureDataTablesClient

## Table of contents

### Constructors

- [constructor](azuredatatablesclient.md#constructor)

### Properties

- [authentication\_method](azuredatatablesclient.md#authentication_method)

### Methods

- [\_clientBySharedKeyCredential](azuredatatablesclient.md#_clientbysharedkeycredential)
- [drop](azuredatatablesclient.md#drop)
- [empty](azuredatatablesclient.md#empty)
- [exists](azuredatatablesclient.md#exists)
- [remove](azuredatatablesclient.md#remove)
- [rows](azuredatatablesclient.md#rows)
- [service\_client](azuredatatablesclient.md#service_client)
- [table\_client](azuredatatablesclient.md#table_client)
- [valid\_environment](azuredatatablesclient.md#valid_environment)

## Constructors

### constructor

\+ **new AzureDataTablesClient**(`props?`: constructorProps): [*AzureDataTablesClient*](azuredatatablesclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | constructorProps |

**Returns:** [*AzureDataTablesClient*](azuredatatablesclient.md)

Defined in: [client.ts:13](https://github.com/verikono/azure-datatable-tools/blob/ae34274/src/client.ts#L13)

## Properties

### authentication\_method

• **authentication\_method**: *string*

Defined in: [client.ts:13](https://github.com/verikono/azure-datatable-tools/blob/ae34274/src/client.ts#L13)

## Methods

### \_clientBySharedKeyCredential

▸ `Private`**_clientBySharedKeyCredential**(`props`: \_clientBySharedKeyCredentialProps): *TableServiceClient* \| *TableClient*

#### Parameters:

Name | Type |
:------ | :------ |
`props` | \_clientBySharedKeyCredentialProps |

**Returns:** *TableServiceClient* \| *TableClient*

Defined in: [client.ts:139](https://github.com/verikono/azure-datatable-tools/blob/ae34274/src/client.ts#L139)

___

### drop

▸ **drop**(`props`: dropProps): *Promise*<boolean\>

Drop a table

#### Parameters:

Name | Type |
:------ | :------ |
`props` | dropProps |

**Returns:** *Promise*<boolean\>

Defined in: [client.ts:102](https://github.com/verikono/azure-datatable-tools/blob/ae34274/src/client.ts#L102)

___

### empty

▸ **empty**(): *Promise*<void\>

Empty a table

**Returns:** *Promise*<void\>

Defined in: [client.ts:122](https://github.com/verikono/azure-datatable-tools/blob/ae34274/src/client.ts#L122)

___

### exists

▸ **exists**(`props`: existsProps): *Promise*<boolean\>

Check for the existence of a table

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | existsProps | the keyword argument object   |

**Returns:** *Promise*<boolean\>

true when the table exists

Defined in: [client.ts:81](https://github.com/verikono/azure-datatable-tools/blob/ae34274/src/client.ts#L81)

___

### remove

▸ **remove**(): *Promise*<void\>

Remove a row by Parition and Row Key

**Returns:** *Promise*<void\>

Defined in: [client.ts:130](https://github.com/verikono/azure-datatable-tools/blob/ae34274/src/client.ts#L130)

___

### rows

▸ **rows**(`props`: rowsProps): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`props` | rowsProps |

**Returns:** *Promise*<void\>

Defined in: [client.ts:135](https://github.com/verikono/azure-datatable-tools/blob/ae34274/src/client.ts#L135)

___

### service\_client

▸ **service_client**(): *TableServiceClient*

**Returns:** *TableServiceClient*

Defined in: [client.ts:20](https://github.com/verikono/azure-datatable-tools/blob/ae34274/src/client.ts#L20)

___

### table\_client

▸ **table_client**(`props`: tableClientProps): *Promise*<TableClient\>

#### Parameters:

Name | Type |
:------ | :------ |
`props` | tableClientProps |

**Returns:** *Promise*<TableClient\>

Defined in: [client.ts:35](https://github.com/verikono/azure-datatable-tools/blob/ae34274/src/client.ts#L35)

___

### valid\_environment

▸ **valid_environment**(): *void*

**Returns:** *void*

Defined in: [client.ts:177](https://github.com/verikono/azure-datatable-tools/blob/ae34274/src/client.ts#L177)
