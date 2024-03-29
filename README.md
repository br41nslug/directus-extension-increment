# Directus Extension Increment Values

As the name suggests a basic extension for incrementing fields in a single API call.

> Tested with Directus 10.10.4

## Usages

This middleware will intercept any `PATCH` requests to `/items/:collection/:item` and replace any `increment(<number>)` or `increment(<float>)` value with an incremented value in the body before handing it over to the regular directus item handler.

```
PATCH /items/test
{ "test_increment": "increment(2)" }
```
**response**
```
{ "data": { "test_increment": 42 } }
```

> WARNING: This function is **dumb**! It only works on the first level of the body and does not check the field type (so if used on a string will end something like `"cool string11111"` if incremented 5 times)