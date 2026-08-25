import os
from typing import List, Dict, Any, Optional
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

from config import settings

class RAGService:
    def __init__(self):
        self.vector_store_dir = settings.VECTORSTORE_DIR
        self.vector_store: Optional[FAISS] = None
        self._load_vector_store()

    def get_embeddings(self):
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        return GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=api_key
        )

    def _load_vector_store(self):
        index_path = os.path.join(self.vector_store_dir, "index.faiss")
        if os.path.exists(index_path):
            try:
                embeddings = self.get_embeddings()
                self.vector_store = FAISS.load_local(
                    self.vector_store_dir,
                    embeddings,
                    allow_dangerous_deserialization=True
                )
            except Exception as e:
                print(f"Error loading FAISS index: {e}")
                self.vector_store = None

    def add_documents(self, docs: List[Document]):
        embeddings = self.get_embeddings()
        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(docs, embeddings)
        else:
            self.vector_store.add_documents(docs)
        
        # Save to disk
        self.vector_store.save_local(self.vector_store_dir)

    def query(self, question: str) -> Dict[str, Any]:
        if self.vector_store is None:
            return {
                "answer": "I couldn't find this information in the provided documents.",
                "sources": []
            }

        try:
            api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
            if not api_key:
                return {
                    "answer": "Gemini API Key is not configured. Please set your API Key in settings.",
                    "sources": []
                }

            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=api_key,
                temperature=0.2
            )

            retriever = self.vector_store.as_retriever(search_kwargs={"k": 4})
            
            system_prompt = (
                "You are an assistant trained strictly on the provided document context.\n"
                "Answer the user's question using ONLY the provided context below.\n"
                "If the information required to answer the question is NOT present in the context, "
                "you MUST respond exactly with: 'I couldn't find this information in the provided documents.'\n"
                "Do NOT use external knowledge.\n\n"
                "Context:\n{context}"
            )

            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("human", "{input}")
            ])

            combine_docs_chain = create_stuff_documents_chain(llm, prompt)
            retrieval_chain = create_retrieval_chain(retriever, combine_docs_chain)

            res = retrieval_chain.invoke({"input": question})

            sources = []
            if "context" in res:
                for doc in res["context"]:
                    sources.append({
                        "source": doc.metadata.get("source", "Unknown"),
                        "page": doc.metadata.get("page", 1),
                        "snippet": doc.page_content[:200]
                    })

            return {
                "answer": res.get("answer", "I couldn't find this information in the provided documents."),
                "sources": sources
            }
        except Exception as e:
            return {
                "answer": f"Error querying documents: {str(e)}",
                "sources": []
            }

rag_service = RAGService()
