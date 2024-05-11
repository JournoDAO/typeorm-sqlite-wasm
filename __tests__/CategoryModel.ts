import { EntitySchema } from "typeorm/browser"

export interface Category {
    id: number
    name: string
}

export const CategoryEntity = new EntitySchema<Category>({
    name: "category",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        name: {
            type: String,
        },
    },
})
