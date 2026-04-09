import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
import { z } from "zod";
var createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const base = z.object({
  accessToken: z.string().min(10)
});
const studentPayload = base.extend({
  email: z.string().email(),
  dni: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  legajo: z.string().min(1),
  program_id: z.string().optional(),
  year: z.number().int().min(1).max(10).optional(),
  status: z.enum(["active", "inactive", "graduated", "suspended"]).optional()
});
const professorPayload = base.extend({
  email: z.string().email(),
  dni: z.string().min(1),
  name: z.string().min(1),
  department: z.string().min(1)
});
const provisionStudentWithAuth = createServerFn({
  method: "POST"
}).inputValidator((raw) => studentPayload.parse(raw)).handler(createSsrRpc("07ff256b42a2a359f26dcd111a6a3a8177caa98be4eba7eef5a1ff88f40aa76d"));
const provisionProfessorWithAuth = createServerFn({
  method: "POST"
}).inputValidator((raw) => professorPayload.parse(raw)).handler(createSsrRpc("d2ead39847eb66636da878225740b906e0221eb58dfa9d882867ae0986b94475"));
export {
  provisionProfessorWithAuth as a,
  provisionStudentWithAuth as p
};
