from pydantic import BaseModel, Field


class ItemBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None
    category: str | None = None
    image_url: str | None = None
    price: float = Field(gt=0)
    stock: int = Field(ge=0, default=0)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = None
    category: str | None = None
    image_url: str | None = None
    price: float | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)


class ItemOut(ItemBase):
    id: int

    model_config = {"from_attributes": True}
