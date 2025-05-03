## NextJS is an Edge Time Framework
- Unlike traditional backends, nextjs is not up at all times. The things get executed as requests come.
- When we are creating the database connectivity for example, yes we will have to execute it with each request, but there can be a possibility of the connectivity already existing, we need to watch out for that as well. . (Suppose the next request came 2 seconds after the first connection)

## Steps for the project
- 1. Install and Initialize the project
- 2. Write the models using mongoose
- 3. Write Schema Validations using Zod
- 4. Write the database connection
- 5. Install Resend and React Email and setup
- 6. Write the tsx for emails and create helper functions for sending them.
- 7. Create standardized type for API Reponse
