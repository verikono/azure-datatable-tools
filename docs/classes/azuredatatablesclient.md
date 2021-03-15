[verikono-azure-datatable-tools](../README.md) / [Exports](../modules.md) / AzureDataTablesClient

# Class: AzureDataTablesClient

## Table of contents

### Constructors

- [constructor](azuredatatablesclient.md#constructor)

### Properties

- [authentication\_method](azuredatatablesclient.md#authentication_method)

### Methods

- [\_clientBySharedKeyCredential](azuredatatablesclient.md#_clientbysharedkeycredential)
- [\_insertAsRecords](azuredatatablesclient.md#_insertasrecords)
- [\_waitUntilTableSpaceReady](azuredatatablesclient.md#_waituntiltablespaceready)
- [count](azuredatatablesclient.md#count)
- [drop](azuredatatablesclient.md#drop)
- [empty](azuredatatablesclient.md#empty)
- [exists](azuredatatablesclient.md#exists)
- [filter](azuredatatablesclient.md#filter)
- [find](azuredatatablesclient.md#find)
- [persist](azuredatatablesclient.md#persist)
- [reduce](azuredatatablesclient.md#reduce)
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

Defined in: [client.ts:14](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L14)

## Properties

### authentication\_method

• **authentication\_method**: *string*

Defined in: [client.ts:14](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L14)

## Methods

### \_clientBySharedKeyCredential

▸ `Private`**_clientBySharedKeyCredential**(`props`: \_clientBySharedKeyCredentialProps): *TableServiceClient* \| *TableClient*

#### Parameters:

Name | Type |
:------ | :------ |
`props` | \_clientBySharedKeyCredentialProps |

**Returns:** *TableServiceClient* \| *TableClient*

Defined in: [client.ts:542](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L542)

___

### \_insertAsRecords

▸ `Private`**_insertAsRecords**(`props`: \_insertAsRecordsProps): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`props` | \_insertAsRecordsProps |

**Returns:** *Promise*<any\>

Defined in: [client.ts:454](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L454)

___

### \_waitUntilTableSpaceReady

▸ `Private`**_waitUntilTableSpaceReady**(`props`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** *void*

Defined in: [client.ts:538](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L538)

___

### count

▸ **count**(`props`: countProps): *Promise*<number\>

Get the count of the rows.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | countProps | Object the keyword argument object   |

**Returns:** *Promise*<number\>

Promise<number> the number of rows

Defined in: [client.ts:362](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L362)

___

### drop

▸ **drop**(`props`: dropProps): *Promise*<boolean\>

Drop a table

Due to Azure's operations queue, dropping a table makes the namespace inaccessible for ~45seconds to a minute. If you're
dropping the table to replace it or need access to the namespace quickly, use empty which will probably be faster up to
~100,000 rows.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | dropProps | Object the keyword object   |

**Returns:** *Promise*<boolean\>

Promise resolving true upon success.

Defined in: [client.ts:137](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L137)

___

### empty

▸ **empty**(`props`: emptyProps): *Promise*<boolean\>

Empty a table

This method can be useful when replacing a table entirely due to Azure's operation queue taking upwards of 45 seconds
at times until it can make a tablename available for common use.

#### Parameters:

Name | Type |
:------ | :------ |
`props` | emptyProps |

**Returns:** *Promise*<boolean\>

Defined in: [client.ts:161](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L161)

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

Defined in: [client.ts:97](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L97)

___

### filter

▸ **filter**(`props`: filterProps): *Promise*<any[]\>

Filter rows.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | filterProps | Object the keyword argument object   |

**Returns:** *Promise*<any[]\>

Defined in: [client.ts:325](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L325)

___

### find

▸ **find**(`props`: findProps): *Promise*<record\>

#### Parameters:

Name | Type |
:------ | :------ |
`props` | findProps |

**Returns:** *Promise*<record\>

Defined in: [client.ts:255](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L255)

___

### persist

▸ **persist**(`props`: persistProps): *Promise*<boolean\>

Persist data to a table initially dropping/emptying the table if it exists leaving the table being a persisted
representation of the argued data.

Performance concern:
This method empties the table if it exists rather than dropping it and thus avoiding the 30 second queue in azure
which occurs upon table deletion. If the datatable is quite large it may be more optimal to actually drop the table
and suffer the 30 second wait. IF that sounds like you, argue "forceDrop": true to the method keyword argument.

#### Parameters:

Name | Type |
:------ | :------ |
`props` | persistProps |

**Returns:** *Promise*<boolean\>

Defined in: [client.ts:392](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L392)

___

### reduce

▸ **reduce**(`props`: reduceProps): *Promise*<any\>

Reduce on rows.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | reduceProps | Object the keyword argument object   |

**Returns:** *Promise*<any\>

Promise<any> the reduced value

Defined in: [client.ts:291](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L291)

___

### remove

▸ **remove**(): *Promise*<void\>

Remove a row by Parition and Row Key

**Returns:** *Promise*<void\>

Defined in: [client.ts:217](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L217)

___

### rows

▸ **rows**(`props`: rowsProps): *Promise*<record[]\>

Gather rows

#### Parameters:

Name | Type |
:------ | :------ |
`props` | rowsProps |

**Returns:** *Promise*<record[]\>

Defined in: [client.ts:227](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L227)

___

### service\_client

▸ **service_client**(): *TableServiceClient*

**Returns:** *TableServiceClient*

Defined in: [client.ts:21](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L21)

___

### table\_client

▸ **table_client**(`props`: tableClientProps): *Promise*<TableClient\>

#### Parameters:

Name | Type |
:------ | :------ |
`props` | tableClientProps |

**Returns:** *Promise*<TableClient\>

Defined in: [client.ts:36](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L36)

___

### valid\_environment

▸ **valid_environment**(): *void*

**Returns:** *void*

Defined in: [client.ts:580](https://github.com/verikono/azure-datatable-tools/blob/e9bb01a/src/client.ts#L580)
