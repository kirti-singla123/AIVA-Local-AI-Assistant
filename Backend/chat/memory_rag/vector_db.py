import json
import math

def cosine_similarity(vec_a, vec_b):
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    magnitude_a = math.sqrt(sum(a * a for a in vec_a))
    magnitude_b = math.sqrt(sum(b * b for b in vec_b))
    if magnitude_a == 0 or magnitude_b == 0:
        return 0
    return dot_product / (magnitude_a * magnitude_b)

class SimpleVectorDB:
    def __init__(self):
        self.vectors = []
        self.documents = []
        self.ids = []
    
    def search(self, query_vector, top_k=3):
        scores = []
        for i in range(len(self.vectors)):
            score = cosine_similarity(query_vector, self.vectors[i])
            scores.append((score, self.documents[i]))
        
        scores.sort(key=lambda x: x[0], reverse=True)
        return scores[:top_k]

    def add(self, doc_id, text, vector):
        self.ids.append(doc_id)
        self.documents.append(text)
        self.vectors.append(vector)

    def __len__(self):
        return len(self.vectors)

    def save(self, filepath):
        data = {
            "ids": self.ids,
            "documents": self.documents,
            "vectors": self.vectors
        }
        with open(filepath, "w") as f:
            json.dump(data, f)

    def load(self, filepath):
        with open(filepath, "r") as f:
            data = json.load(f)
        self.ids = data["ids"]
        self.documents = data["documents"]
        self.vectors = data["vectors"]