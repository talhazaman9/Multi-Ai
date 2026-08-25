import os
import pandas as pd
from typing import List
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

class DocumentProcessor:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 150):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )

    def process_file(self, file_path: str, filename: str) -> List[Document]:
        ext = os.path.splitext(filename)[1].lower()
        if ext == ".pdf":
            loader = PyPDFLoader(file_path)
            docs = loader.load()
        elif ext in [".docx", ".doc"]:
            loader = Docx2txtLoader(file_path)
            docs = loader.load()
        elif ext in [".txt", ".md"]:
            loader = TextLoader(file_path, encoding="utf-8")
            docs = loader.load()
        elif ext in [".csv", ".tsv"]:
            sep = "\t" if ext == ".tsv" else ","
            df = pd.read_csv(file_path, sep=sep)
            text_content = f"Dataset: {filename}\nShape: {df.shape[0]} rows, {df.shape[1]} columns\n"
            text_content += f"Columns: {', '.join(df.columns.astype(str))}\n\n"
            try:
                text_content += df.to_markdown(index=False) if len(df) <= 500 else df.to_csv(index=False)
            except Exception:
                text_content += df.to_csv(index=False)
            docs = [Document(page_content=text_content, metadata={"source": filename})]
        elif ext in [".xlsx", ".xls"]:
            excel = pd.ExcelFile(file_path)
            docs = []
            for sheet_name in excel.sheet_names:
                df = pd.read_excel(file_path, sheet_name=sheet_name)
                text_content = f"Workbook: {filename} (Sheet: {sheet_name})\n"
                text_content += f"Shape: {df.shape[0]} rows, {df.shape[1]} columns\n"
                text_content += f"Columns: {', '.join(df.columns.astype(str))}\n\n"
                try:
                    text_content += df.to_markdown(index=False) if len(df) <= 500 else df.to_csv(index=False)
                except Exception:
                    text_content += df.to_csv(index=False)
                docs.append(Document(page_content=text_content, metadata={"source": f"{filename} ({sheet_name})"}))
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        # Add source metadata
        for doc in docs:
            doc.metadata["source"] = filename

        return self.splitter.split_documents(docs)

document_processor = DocumentProcessor()
