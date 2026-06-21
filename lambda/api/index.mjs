/**
 * Scents by Miral — API Lambda Handler
 *
 * Handles all API routes for the frontend:
 *   GET    /wishlist              — get user's wishlist
 *   POST   /wishlist              — add item to wishlist
 *   DELETE /wishlist/{productId}  — remove item from wishlist
 *   GET    /addresses             — get user's saved addresses
 *   POST   /addresses             — add a new address
 *   DELETE /addresses/{addressId} — remove an address
 *   GET    /products              — get all active products (public)
 *   POST   /products              — add a product (admin only)
 *   DELETE /products/{productId}  — delete a product (admin only)
 *
 * Authentication:
 *   API Gateway validates the Cognito JWT token before this
 *   function is called. The user's Cognito sub (unique ID) is
 *   extracted from the token and used as the DynamoDB partition key.
 *   Every user's data is completely isolated from every other user.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  GetCommand
} from "@aws-sdk/lib-dynamodb";

const client    = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const WISHLIST_TABLE  = process.env.WISHLIST_TABLE;
const ADDRESSES_TABLE = process.env.ADDRESSES_TABLE;
const PRODUCTS_TABLE  = process.env.PRODUCTS_TABLE;

// CORS headers — sent with every response
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS"
};

// ── Response helpers ─────────────────────────────────────────────
const ok        = (body)  => ({ statusCode: 200, headers: CORS, body: JSON.stringify(body) });
const created   = (body)  => ({ statusCode: 201, headers: CORS, body: JSON.stringify(body) });
const notFound  = (msg)   => ({ statusCode: 404, headers: CORS, body: JSON.stringify({ error: msg }) });
const forbidden = ()      => ({ statusCode: 403, headers: CORS, body: JSON.stringify({ error: "Forbidden" }) });
const serverErr = (err)   => {
  console.error(err);
  return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Internal server error" }) };
};

// ── Main handler ─────────────────────────────────────────────────
export const handler = async (event) => {

  // Handle CORS preflight requests from the browser
  if (event.requestContext.http.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  const method = event.requestContext.http.method;
  const path   = event.requestContext.http.path;

  // Extract the Cognito user ID from the validated JWT token.
  // This is the "sub" claim — a unique UUID per Cognito user.
  const userId = event.requestContext.authorizer?.jwt?.claims?.sub;
  if (!userId) return forbidden();

  // Check if the user is an admin (has the custom:admin Cognito attribute)
  const isAdmin = event.requestContext.authorizer?.jwt?.claims?.["custom:admin"] === "true";

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    body = {};
  }

  try {

    // ── WISHLIST ─────────────────────────────────────────────────

    if (path === "/wishlist" && method === "GET") {
      const result = await docClient.send(new QueryCommand({
        TableName: WISHLIST_TABLE,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId }
      }));
      return ok(result.Items);
    }

    if (path === "/wishlist" && method === "POST") {
      const { productId, name, category, price, gradient } = body;
      if (!productId) return notFound("productId required");
      await docClient.send(new PutCommand({
        TableName: WISHLIST_TABLE,
        Item: { userId, productId, name, category, price, gradient, addedAt: new Date().toISOString() }
      }));
      return created({ ok: true });
    }

    // DELETE /wishlist/{productId}
    if (path.startsWith("/wishlist/") && method === "DELETE") {
      const productId = decodeURIComponent(path.split("/")[2]);
      await docClient.send(new DeleteCommand({
        TableName: WISHLIST_TABLE,
        Key: { userId, productId }
      }));
      return ok({ ok: true });
    }

    // ── ADDRESSES ────────────────────────────────────────────────

    if (path === "/addresses" && method === "GET") {
      const result = await docClient.send(new QueryCommand({
        TableName: ADDRESSES_TABLE,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId }
      }));
      return ok(result.Items);
    }

    if (path === "/addresses" && method === "POST") {
      const { name, phone, street, city, zip, state, country } = body;
      if (!name || !street || !city || !country) {
        return notFound("name, street, city, country are required");
      }
      const addressId = Date.now().toString();
      await docClient.send(new PutCommand({
        TableName: ADDRESSES_TABLE,
        Item: { userId, addressId, name, phone, street, city, zip, state, country, createdAt: new Date().toISOString() }
      }));
      return created({ ok: true, addressId });
    }

    // DELETE /addresses/{addressId}
    if (path.startsWith("/addresses/") && method === "DELETE") {
      const addressId = decodeURIComponent(path.split("/")[2]);
      await docClient.send(new DeleteCommand({
        TableName: ADDRESSES_TABLE,
        Key: { userId, addressId }
      }));
      return ok({ ok: true });
    }

    // ── PRODUCTS ─────────────────────────────────────────────────
    // GET is public (no auth check). POST and DELETE require admin.

    if (path === "/products" && method === "GET") {
      const result = await docClient.send(new ScanCommand({
        TableName: PRODUCTS_TABLE,
        FilterExpression: "active = :t",
        ExpressionAttributeValues: { ":t": true }
      }));
      return ok(result.Items);
    }

    if (path === "/products/all" && method === "GET" && isAdmin) {
      const result = await docClient.send(new ScanCommand({ TableName: PRODUCTS_TABLE }));
      return ok(result.Items);
    }

    if (path === "/products" && method === "POST") {
      if (!isAdmin) return forbidden();
      const productId = body.productId || Date.now().toString();
      await docClient.send(new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: { productId, ...body, updatedAt: new Date().toISOString() }
      }));
      return created({ ok: true, productId });
    }

    // DELETE /products/{productId}
    if (path.startsWith("/products/") && method === "DELETE") {
      if (!isAdmin) return forbidden();
      const productId = decodeURIComponent(path.split("/")[2]);
      await docClient.send(new DeleteCommand({
        TableName: PRODUCTS_TABLE,
        Key: { productId }
      }));
      return ok({ ok: true });
    }

    return notFound("Route not found");

  } catch (err) {
    return serverErr(err);
  }
};
