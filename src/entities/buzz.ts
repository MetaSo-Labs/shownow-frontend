import { path } from "ramda";

const buzzSchema = {
  name: "buzz",
  nodeName: "simplebuzz",
  path: "/protocols/simplebuzz",
  versions: [
    {
      version: 1,
      body: [
        {
          name: "content",
          type: "string",
        },
        {
          name: "contentType",
          type: "string",
        },
        {
          name: "quotePin",
          type: "string",
        },
        {
          name: "attachments",
          type: "array",
        },
      ],
    },
  ],
};

export default buzzSchema;

export const getBuzzSchemaWithCustomHost = (host: string) => {
  return {
    ...buzzSchema,
    path: `${host}${buzzSchema.path}`,
  };
};
