const commentEntitySchema = {
  name: 'comment',
  nodeName: 'paycomment',
  path: '/protocols/paycomment',
  versions: [
    {
      version: 1,
      body: [
        {
          name: 'content',
          type: 'string',
        },
        {
          name: 'contentType',
          type: 'string',
        },
        {
          name: 'commentTo',
          type: 'string',
        },
      ],
    },
  ],
}

export default commentEntitySchema;

export const getCommentEntitySchemaWithCustomHost= (host:string) => {
  return{
    ...commentEntitySchema,
    path: `${host}${commentEntitySchema.path}`
  }
}
