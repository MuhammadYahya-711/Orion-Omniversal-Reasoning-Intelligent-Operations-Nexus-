import os
import streamlit as st
from groq import Groq

st.set_page_config(
    page_title="ORION",
    page_icon="✦",
    layout="wide"
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
    font-family: 'Inter', sans-serif;
}

.stApp {
    background:
        radial-gradient(circle at 20% 20%, rgba(0,119,255,.16), transparent 28%),
        radial-gradient(circle at 80% 75%, rgba(0,170,255,.10), transparent 30%),
        linear-gradient(135deg, #02050c, #06101f 45%, #02050c);
    color: #f5f7ff;
}

.stApp::before,
.stApp::after {
    content: "";
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
}

.stApp::before {
    width: 420px;
    height: 420px;
    left: 8%;
    top: 18%;
    background: rgba(0,120,255,.10);
    filter: blur(90px);
    animation: orbOne 10s ease-in-out infinite alternate;
}

.stApp::after {
    width: 360px;
    height: 360px;
    right: 10%;
    bottom: 12%;
    background: rgba(0,190,255,.08);
    filter: blur(100px);
    animation: orbTwo 13s ease-in-out infinite alternate;
}

@keyframes orbOne {
    0% { transform: translate(0,0) scale(1); }
    50% { transform: translate(130px,-50px) scale(1.15); }
    100% { transform: translate(40px,100px) scale(.95); }
}

@keyframes orbTwo {
    0% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-100px,60px) scale(1.2); }
    100% { transform: translate(70px,-80px) scale(.9); }
}

.block-container {
    position: relative;
    z-index: 2;
    padding-top: 2.5rem;
}

.orion-title {
    font-size: 4rem;
    font-weight: 800;
    letter-spacing: -3px;
    line-height: 1;
    background: linear-gradient(90deg,#fff,#75b9ff,#dff3ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.orion-subtitle {
    margin-top: 8px;
    color: #8b9bb5;
    font-size: 1rem;
}

.glass-card {
    background: rgba(7,15,29,.68);
    border: 1px solid rgba(110,175,255,.13);
    border-radius: 20px;
    padding: 24px;
    backdrop-filter: blur(20px);
    box-shadow: 0 20px 60px rgba(0,0,0,.30);
    transition: all .35s ease;
}

.glass-card:hover {
    transform: translateY(-5px);
    border-color: rgba(80,165,255,.30);
}

.feature-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 8px;
}

.feature-text {
    color: #8d9ab0;
    font-size: .9rem;
    line-height: 1.6;
}

section[data-testid="stSidebar"] {
    background: rgba(3,8,17,.96);
    border-right: 1px solid rgba(90,160,255,.10);
}

.stButton > button {
    border-radius: 11px;
    background: rgba(18,40,70,.72);
    color: white;
    border: 1px solid rgba(80,155,255,.20);
    font-weight: 600;
}

.stButton > button:hover {
    border-color: rgba(80,170,255,.55);
    box-shadow: 0 0 22px rgba(0,120,255,.18);
}

[data-testid="stChatMessage"] {
    background: rgba(8,17,32,.70);
    border: 1px solid rgba(100,160,255,.09);
    border-radius: 18px;
    backdrop-filter: blur(15px);
}

#MainMenu, footer {
    visibility: hidden;
}
</style>
""", unsafe_allow_html=True)

api_key = st.secrets.get("GROQ_API_KEY", os.getenv("GROQ_API_KEY"))
client = Groq(api_key=api_key) if api_key else None

if "messages" not in st.session_state:
    st.session_state.messages = []

with st.sidebar:
    st.markdown("## ✦ ORION")
    st.caption("Omniversal Reasoning and Intelligent Operations Nexus")
    st.divider()

    mode = st.selectbox(
        "Workspace Mode",
        [
            "General Intelligence",
            "Study & Research",
            "Coding",
            "Writing",
            "Problem Solving",
            "Creative Thinking"
        ]
    )

    st.divider()

    if st.button("＋ New Conversation", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

    if st.button("Clear Chat", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

    st.divider()
    st.caption("One Intelligence.")
    st.caption("Infinite Possibilities.")

st.markdown(
    '<div class="orion-title">ORION</div>',
    unsafe_allow_html=True
)

st.markdown(
    '<div class="orion-subtitle">One Intelligence. Infinite Possibilities.</div>',
    unsafe_allow_html=True
)

st.markdown("<br>", unsafe_allow_html=True)

if not st.session_state.messages:

    c1, c2, c3 = st.columns(3)

    with c1:
        st.markdown("""
        <div class="glass-card">
            <div class="feature-title">◈ Think</div>
            <div class="feature-text">
                Analyze ideas, questions and complex problems with clarity.
            </div>
        </div>
        """, unsafe_allow_html=True)

    with c2:
        st.markdown("""
        <div class="glass-card">
            <div class="feature-title">⌁ Create</div>
            <div class="feature-text">
                Generate concepts, writing, plans and original ideas.
            </div>
        </div>
        """, unsafe_allow_html=True)

    with c3:
        st.markdown("""
        <div class="glass-card">
            <div class="feature-title">⚡ Execute</div>
            <div class="feature-text">
                Turn conversations into practical actions and solutions.
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

prompt = st.chat_input("Ask ORION anything...")

if prompt:

    st.session_state.messages.append({
        "role": "user",
        "content": prompt
    })

    with st.chat_message("user"):
        st.markdown(prompt)

    if not client:

        response = """
### ORION is not connected yet.

Add your Groq API key to Streamlit Cloud → **Settings → Secrets**:

```toml
GROQ_API_KEY = "your_api_key_here"
