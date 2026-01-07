# CORS Configuration Guide for Next.js and Express

## Understanding CORS

**CORS (Cross-Origin Resource Sharing) is already configured on your Express server!** ✅

Your Express API at `http://localhost:5173` is configured to accept requests from your Next.js frontend at `http://localhost:3000`. You don't need to configure CORS on the Next.js side - just make requests directly.

## Option 1: Direct API Calls from Next.js Frontend (Recommended)

Since CORS is already set up on your Express server, you can make requests directly from your Next.js components:

### Using Fetch API:

```typescript
// In your Next.js component or API client
async function getBankTypes() {
  try {
    const response = await fetch('http://localhost:5173/api/bank-type');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bank types:', error);
    throw error;
  }
}
```

### Using in a React Component:

```typescript
'use client'; // For Next.js App Router

import { useEffect, useState } from 'react';

export default function BankTypeSelector() {
  const [bankTypes, setBankTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBankTypes() {
      try {
        const response = await fetch('http://localhost:5173/api/bank-type');
        const data = await response.json();
        if (data.success) {
          setBankTypes(data.values);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBankTypes();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <select>
      {bankTypes.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
  );
}
```

### Using in Server Components (Next.js App Router):

```typescript
// app/bank-types/page.tsx (Server Component)
async function getBankTypes() {
  const res = await fetch('http://localhost:5173/api/bank-type', {
    cache: 'no-store', // or 'force-cache' for caching
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch bank types');
  }
  
  return res.json();
}

export default async function BankTypesPage() {
  const data = await getBankTypes();
  
  return (
    <div>
      <h1>Bank Types</h1>
      <ul>
        {data.values.map((type: string) => (
          <li key={type}>{type}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Option 2: Next.js API Routes as Proxy (Alternative)

If you prefer to proxy requests through Next.js API routes (avoids CORS entirely), you can create API routes in Next.js:

### Create a Next.js API Route:

```typescript
// app/api/bank-type/route.ts (Next.js App Router)
export async function GET() {
  try {
    const response = await fetch('http://localhost:5173/api/bank-type');
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to fetch bank types' },
      { status: 500 }
    );
  }
}
```

Then call it from your frontend:
```typescript
const response = await fetch('/api/bank-type'); // Same origin, no CORS needed
```

### For Pages Router (Next.js 12 and earlier):

```typescript
// pages/api/bank-type.ts
export default async function handler(req: any, res: any) {
  try {
    const response = await fetch('http://localhost:5173/api/bank-type');
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch' });
  }
}
```

## Option 3: Configure CORS in Next.js API Routes (If Needed)

If you're creating Next.js API routes that need to accept requests from other origins:

```typescript
// app/api/your-endpoint/route.ts
export async function GET(request: Request) {
  return Response.json({ message: 'Hello' }, {
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

Or use the `cors` package:

```bash
npm install cors
npm install --save-dev @types/cors
```

```typescript
// pages/api/your-endpoint.ts (Pages Router)
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

const cors = Cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);
  
  res.json({ message: 'Hello' });
}
```

## Summary

✅ **For your current setup**: Use **Option 1** - Make direct requests from Next.js to `http://localhost:5173/api/bank-type`. CORS is already configured on the Express server.

✅ **Your Express CORS config** (already set up):
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

This means your Next.js frontend can make requests directly without any additional CORS configuration! 🎉


