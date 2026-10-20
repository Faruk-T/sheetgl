# Remote Operations & Enterprise REST DTO Guide

SheetGL is natively designed to operate over datasets with millions of rows by delegating pagination, sorting, filtering, and grouping to server-side endpoints using a **Standard Enterprise REST DTO convention**.

---

## 1. How RemoteDataStore Communicates

When virtual scrolling occurs or when the user changes filters, `RemoteDataStore` constructs HTTP GET requests with URL-encoded query parameters:

```
GET /api/v1/customers?skip=0&take=100&sort=[{"selector":"balance","desc":true}]&filter=["status","=","active"]
```

### Request Query Parameters

| Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `skip` | `number` | `100` | The number of records to skip (paging offset). |
| `take` | `number` | `50` | The number of records to return (page size). |
| `sort` | `JSON string` | `[{"selector":"name","desc":false}]` | Array of sort criteria. |
| `filter` | `JSON string` | `["status","=","active"]` | Standard binary or composite AST filter expressions. |
| `group` | `JSON string` | `[{"selector":"city","isExpanded":false}]` | Grouping criteria. |
| `requireTotalCount`| `boolean` | `true` | Requests the total count of matching records across all pages. |

---

## 2. Server Response JSON Format

Your API endpoint should return a JSON response formatted as follows:

```json
{
  "data": [
    { "id": 101, "name": "Acme Global", "balance": 45000.0, "status": "active" },
    { "id": 102, "name": "Nexus Cloud", "balance": 72500.0, "status": "active" }
  ],
  "totalCount": 24500,
  "summary": {
    "balance": 1102500.0
  }
}
```

---

## 3. Client-Side Setup

```tsx
import React, { useMemo } from 'react';
import { SheetGL, RemoteDataStore, ColumnDef } from 'sheetgl';

export function RemoteCustomersGrid() {
  const remoteStore = useMemo(() => new RemoteDataStore({
    url: 'https://api.yourdomain.com/v1/customers',
    keyField: 'id',
    chunkSize: 100, // Prefetch size for LRU caching
    remoteOperations: {
      paging: true,
      sorting: true,
      filtering: true,
      grouping: false,
    },
  }), []);

  const columns: ColumnDef[] = useMemo(() => [
    { id: 'id', title: 'ID', type: 'number', width: 80, sortable: true },
    { id: 'name', title: 'Customer Name', type: 'text', width: 250, sortable: true, filterable: true },
    { id: 'balance', title: 'Balance', type: 'currency', width: 140, sortable: true },
  ], []);

  return <SheetGL dataSource={remoteStore} columns={columns} />;
}
```

---

## 4. Backend Implementation Examples

### 4.1. Node.js (Express + TypeScript + SQL)

```typescript
import express, { Request, Response } from 'express';
import { db } from './database';

const app = express();

app.get('/api/v1/customers', async (req: Request, res: Response) => {
  const skip = parseInt(req.query.skip as string) || 0;
  const take = parseInt(req.query.take as string) || 50;
  const sortParam = req.query.sort ? JSON.parse(req.query.sort as string) : [];
  const filterParam = req.query.filter ? JSON.parse(req.query.filter as string) : null;

  let query = db('customers');
  let countQuery = db('customers');

  // 1. Apply Filtering
  if (filterParam && Array.isArray(filterParam)) {
    const [field, op, value] = filterParam;
    if (op === '=') {
      query = query.where(field, value);
      countQuery = countQuery.where(field, value);
    } else if (op === 'contains') {
      query = query.whereILike(field, `%${value}%`);
      countQuery = countQuery.whereILike(field, `%${value}%`);
    }
  }

  // 2. Apply Sorting
  if (sortParam.length > 0) {
    for (const rule of sortParam) {
      query = query.orderBy(rule.selector, rule.desc ? 'desc' : 'asc');
    }
  } else {
    query = query.orderBy('id', 'asc');
  }

  // 3. Apply Pagination
  const [data, [{ totalCount }]] = await Promise.all([
    query.offset(skip).limit(take),
    countQuery.count('* as totalCount'),
  ]);

  res.json({
    data,
    totalCount: Number(totalCount),
  });
});
```

### 4.2. ASP.NET Core (.NET 8/9 with DataSourceLoader)

`RemoteDataStore` seamlessly integrates with ASP.NET Core data loaders:

```csharp
[HttpGet]
public async Task<IActionResult> Get(DataSourceLoadOptions loadOptions)
{
    var customers = _context.Customers;
    var loadResult = await DataSourceLoader.LoadAsync(customers, loadOptions);
    return Ok(loadResult);
}
```

### 4.3. Python (FastAPI + SQLAlchemy)

```python
import json
from fastapi import FastAPI, Query
from sqlalchemy import select, func
from database import async_session, Customer

app = FastAPI()

@app.get("/api/v1/customers")
async def get_customers(
    skip: int = 0,
    take: int = 50,
    sort: str = Query(default=None),
    filter: str = Query(default=None)
):
    async with async_session() as session:
        query = select(Customer)
        count_query = select(func.count(Customer.id))

        # Filter evaluation
        if filter:
            f_expr = json.loads(filter)
            if f_expr[1] == "=":
                query = query.where(getattr(Customer, f_expr[0]) == f_expr[2])
                count_query = count_query.where(getattr(Customer, f_expr[0]) == f_expr[2])

        # Pagination & Execution
        query = query.offset(skip).limit(take)
        result = await session.execute(query)
        total = await session.scalar(count_query)

        return {
            "data": [row.to_dict() for row in result.scalars().all()],
            "totalCount": total
        }
```
