//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type JSONPrimitive = string | number | boolean | null;

export type JSONObject = { [key: string]: JSONValue };

export type JSONArray = JSONValue[];

export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

//	Functions __________________________________________________________________

