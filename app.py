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
.stApp {
    background:
        radial-gradient(circle at 20% 20%, rgba(0,119,255,.15), transparent 30%),
        radial-gradient(circle at 80% 80%, rgba(0,170,255,.10), transparent 30%),
        #030712;
    color: white;
}

.orion-title {
    font-size: 4rem;
    font-weight: 800;
    letter-spacing: -3px;
    background: linear-gradient(90deg,#ffffff,#63b3ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.orion-subtitle {
    color: #8b9bb5;
    font-size: 1.05rem;
}

.card {
    background: rgba(10,20,38,.72);
    border: 1px solid rgba(90,160,255,.15);
    border-radius: 20px;
    padding: 25px;
    margin-top: 20px;
    backdrop-filter: blur(15px);
}

.card-title {
    font-size: 1.15rem;
    font-weight: 700;
}

.card-text {
    color: #8d9ab0;
    margin-top: 8px;
}

section[data-testid="stSidebar"] {
    background: #050a14;
}

#MainMenu, footer {
    visibility: hidden;
}
</style>
""", unsafe_allow_html=True)


# -------------------------
# GROQ
# -------------------------

api_key = st.secrets.get(
    "GROQ_API_KEY",
    os.getenv("GROQ_API_KEY")
)

client = Groq(api_key=api_key) if api_key else None


# -------------------------
# SESSION
# -------------------------

if "messages" not in st.session_state:
    st.session_state.messages = []


# -------------------------
# SIDEBAR
# -------------------------

with st.sidebar:

    st.markdown("## ✦ ORION")

    st.caption(
        "Omniversal Reasoning and Intelligent Operations Nexus"
    )

    st.divider()

    mode = st.selectbox(
        "Workspace",
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

    if st.button(
        "＋ New Conversation",
        use_container_width=True
    ):
        st.session_state.messages = []
        st.rerun()

    if st.button(
        "Clear Chat",
        use_container_width=True
    ):
        st.session_state.messages = []
        st.rerun()

    st.divider()

    st.caption("One Intelligence.")
    st.caption("Infinite Possibilities.")


# -------------------------
# HEADER
# -------------------------

st.markdown(
    '<div class="orion-title">ORION</div>',
    unsafe_allow_html=True
)

st.markdown(
    '<div class="orion-subtitle">'
    'One Intelligence. Infinite Possibilities.'
    '</div>',
    unsafe_allow_html=True
)

st.markdown("<br>", unsafe_allow_html=True)


# -------------------------
# HOME
# -------------------------

if not st.session_state.messages:

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("""
        <div class="card">
            <div class="card-title">◈ Think</div>
            <div class="card-text">
                Analyze ideas, questions and complex problems.
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class="card">
            <div class="card-title">⌁ Create</div>
            <div class="card-text">
                Generate concepts, writing, plans and ideas.
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown("""
        <div class="card">
            <div class="card-title">⚡ Execute</div>
            <div class="card-text">
                Turn conversations into practical actions.
            </div>
        </div>
        """, unsafe_allow_html=True)


# -------------------------
# CHAT HISTORY
# -------------------------

for message in st.session_state.messages:

    with st.chat_message(message["role"]):
        st.markdown(message["content"])


# -------------------------
# CHAT INPUT
# -------------------------

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
### ORION is not connected.

Add your Groq API key in Streamlit Cloud → **Settings → Secrets**

```toml
GROQ_API_KEY = "your_api_key_here"
