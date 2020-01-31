const express = require('express')
const expressGraphQL = require('express-graphql')
const app = express()

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')

const authors = [
    {id:1, name: 'sandeep'},
    {id:2, name: 'sandeep1'},
    {id:3, name: 'sandeep2'}
]

const books =[
    {id: 1, name: 'sandeep book 11', authorId: 1, image: 'https://www.google.com/search?q=sample+google+images&tbm=isch&source=iu&ictx=1&fir=Q0Jd7iQxXXFm7M%253A%252CTkpONpd9b4_5jM%252C_&vet=1&usg=AI4_-kQQtF1cQt0gbesWaDvIUe8Y1BUJSg&sa=X&ved=2ahUKEwivy77ulvjmAhXllOAKHdTAASoQ9QEwAHoECAgQBg#imgrc=Q0Jd7iQxXXFm7M:'},
    {id: 2, name: 'sandeep book 12', authorId: 1 , image: 'https://www.google.com/search?q=sample+google+images&tbm=isch&source=iu&ictx=1&fir=Q0Jd7iQxXXFm7M%253A%252CTkpONpd9b4_5jM%252C_&vet=1&usg=AI4_-kQQtF1cQt0gbesWaDvIUe8Y1BUJSg&sa=X&ved=2ahUKEwivy77ulvjmAhXllOAKHdTAASoQ9QEwAHoECAgQBg#imgrc=Q0Jd7iQxXXFm7M:'},
    {id: 3, name: 'sandeep book 13', authorId: 2 , image: 'https://www.google.com/search?q=sample+google+images&tbm=isch&source=iu&ictx=1&fir=Q0Jd7iQxXXFm7M%253A%252CTkpONpd9b4_5jM%252C_&vet=1&usg=AI4_-kQQtF1cQt0gbesWaDvIUe8Y1BUJSg&sa=X&ved=2ahUKEwivy77ulvjmAhXllOAKHdTAASoQ9QEwAHoECAgQBg#imgrc=Q0Jd7iQxXXFm7M:'},
    {id: 4, name: 'sandeep book 14', authorId: 2 , image: 'https://www.google.com/search?q=sample+google+images&tbm=isch&source=iu&ictx=1&fir=Q0Jd7iQxXXFm7M%253A%252CTkpONpd9b4_5jM%252C_&vet=1&usg=AI4_-kQQtF1cQt0gbesWaDvIUe8Y1BUJSg&sa=X&ved=2ahUKEwivy77ulvjmAhXllOAKHdTAASoQ9QEwAHoECAgQBg#imgrc=Q0Jd7iQxXXFm7M:'},
    {id: 5, name: 'sandeep book 15', authorId: 2 , image: 'https://www.google.com/search?q=sample+google+images&tbm=isch&source=iu&ictx=1&fir=Q0Jd7iQxXXFm7M%253A%252CTkpONpd9b4_5jM%252C_&vet=1&usg=AI4_-kQQtF1cQt0gbesWaDvIUe8Y1BUJSg&sa=X&ved=2ahUKEwivy77ulvjmAhXllOAKHdTAASoQ9QEwAHoECAgQBg#imgrc=Q0Jd7iQxXXFm7M:'},
    {id: 6, name: 'sandeep book 16', authorId: 3 , image: 'https://www.google.com/search?q=sample+google+images&tbm=isch&source=iu&ictx=1&fir=Q0Jd7iQxXXFm7M%253A%252CTkpONpd9b4_5jM%252C_&vet=1&usg=AI4_-kQQtF1cQt0gbesWaDvIUe8Y1BUJSg&sa=X&ved=2ahUKEwivy77ulvjmAhXllOAKHdTAASoQ9QEwAHoECAgQBg#imgrc=Q0Jd7iQxXXFm7M:'},
    {id: 7, name: 'sandeep book 17', authorId: 3 , image: 'https://www.google.com/search?q=sample+google+images&tbm=isch&source=iu&ictx=1&fir=Q0Jd7iQxXXFm7M%253A%252CTkpONpd9b4_5jM%252C_&vet=1&usg=AI4_-kQQtF1cQt0gbesWaDvIUe8Y1BUJSg&sa=X&ved=2ahUKEwivy77ulvjmAhXllOAKHdTAASoQ9QEwAHoECAgQBg#imgrc=Q0Jd7iQxXXFm7M:'}
]

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book in author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        image: {type: GraphQLNonNull(GraphQLString)},
        
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents a Author of a book',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        image: {type: GraphQLNonNull(GraphQLString)}
        
    })
})

const RootQueryType = new GraphQLObjectType ({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        books: {
            type: new GraphQLList(BookType),
            description: 'List of all books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all Authors',
            resolve: () => authors
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType
})


app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))
app.listen(5000.,() => console.log('Server Running'))

