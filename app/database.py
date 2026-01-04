

from sqlmodel import create_engine, Session

DATABASE_URL = "postgresql+psycopg2://postgres:ashwith@localhost:5432/trade_finance"
engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session


def init_db():
    SQLModel.metadata.create_all(engine)