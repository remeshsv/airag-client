# AI-RAG - About the Project
AI-RAG project is a demo project to showcase the AI capabilities of Spring AI.
This is a REACT frontend that has a page on which we could do the following things:

1. Chat with Gemini.
2. Chat with Gemini powered RAG featuring a few PDFs about Movie-making.
3. Admin access - can upload the PDFs to vector store in PostGres

   Backend : https://github.com/remeshsv/remesh-AI-RAG-Example

# Roles
Admin, User

Currently the log in details are directly filled into the postgres table under "users" table.

# Pages
Login as Admin or User
<img width="1497" height="850" alt="image" src="https://github.com/user-attachments/assets/0c0b8669-7751-41e8-b516-6697f91b472b" />

If Admin, you can do three things
1. Ask about movies, its making and history
2. Ask General questions on chat at right-side bottom
3. Add PDFs to the knowledge base that can be used for Point 1.

<img width="1552" height="912" alt="image" src="https://github.com/user-attachments/assets/a4b9a9d9-17ab-4b7f-a885-db57efac4a4e" />

But as User we cannot upload PDFs.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

