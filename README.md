# Face Authentication System 🔐

This project is a **Face Recognition Authentication System** built with:

* **Frontend**: React (camera capture, registration, login)
* **Backend**: Flask (API using MongoDB)
* **Face Recognition Models**:

  *  `ArcFace` via DeepFace for embeddings & authentication
  *  `Haar Cascades` for initial face detection

---

## 🖼️ Models Used

### 1. Haar Cascade (OpenCV)

* Used for basic face detection in images.
* Very fast and lightweight.

### 2. ArcFace (via DeepFace)

* Used for extracting face embeddings.
* Matching is done using cosine similarity.
* Model used within DeepFace: `ArcFace`

---
