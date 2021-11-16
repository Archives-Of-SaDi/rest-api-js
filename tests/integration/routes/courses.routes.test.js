const request = require('supertest');
const { Types: { ObjectId } } = require('mongoose');
const { Course } = require('../../../models/course.model');
const { User } = require('../../../models/user.models');
let server;

describe('/api/courses', () => {
  beforeEach(() => {
    server = require('../../../index');
  })

  afterEach(async () => {
    server.close();
    await Course.remove({});
  })

  describe('GET /', () => {
    it('should return all courses', async () => {
      const categoryId = ObjectId();
      await Course.collection.insertMany([
        {
          title: 'Web',
          category: {
            _id: categoryId,
            name: 'Dasturlash'
          },
          trainer: 'Abbasov Sayidulloh',
          tags: ['dasturlash', 'web'],
          status: 'Active',
          fee: 10
        },
        {
          title: 'Mobile',
          category: {
            _id: categoryId,
            name: 'Dasturlash'
          },
          trainer: 'Abbasov Sayidulloh',
          tags: ['dasturlash', 'mobile'],
          status: 'Active',
          fee: 15
        },
        {
          title: '3D',
          category: {
            _id: categoryId,
            name: 'Dizayn'
          },
          trainer: 'Abbasov Sayidulloh',
          tags: ['dizayn', '3d'],
          status: 'Active',
          fee: 10
        },
      ])

      const response = await request(server).get('/api/courses');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body.some(c => c.title === 'Web')).toBeTruthy();
    })
  })

  describe('GET /:id', () => {
    it('should return 404 if invalid id is given', async () => {
      const response = await request(server).get('/api/courses/123');
      expect(response.status).toBe(404);
    })

    it('should return 404 if no course with the id exist', async () => {
      const categoryId = ObjectId();
      const response = await request(server).get('/api/courses/' + categoryId);
      expect(response.status).toBe(404);
    })

    it('should return a course if valid id is given', async () => {
      const categoryId = ObjectId();
      const course = new Course({
        title: 'Web',
        category: {
          _id: categoryId,
          name: 'Dasturlash'
        },
        trainer: 'Abbasov Sayidulloh',
        tags: ['dasturlash', 'web'],
        status: 'Active',
        fee: 10
      });
      await course.save();

      const response = await request(server).get('/api/courses/' + course._id);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Web');
    })
  })

  // describe('POST /', () => {
  //   let token;
  //   let name;

  //   const execute = async () => {
  //     return await request(server)
  //       .post('/api/courses')
  //       .set('x-auth-token', token)
  //       .send({ name });
  //   }

  //   beforeEach(() => {
  //     token = new User().generateAuthToken();
  //     name = 'dasturlash';
  //   })

  //   it('should return 401 if user is not logged in', async () => {
  //     token = '';
  //     const res = await execute();
  //     expect(res.status).toBe(401);
  //   })

  //   it('should return 404 if invalid id is given', async () => {
  //     const response = await request(server).get('/api/courses/123');
  //     expect(response.status).toBe(404);
  //   })

  //   it('should return 404 if no customer with the id exist', async () => {
  //     const categoriesId = ObjectId();
  //     const response = await request(server).get('/api/courses/' + categoriesId);
  //     expect(response.status).toBe(404);
  //   })

  //   it('should return 400 if category name is less than 3 characters', async () => {
  //     name = '12';
  //     const res = await execute();
  //     expect(res.status).toBe(400);
  //   })

  //   it('should return 400 if category name is more than 50 characters', async () => {
  //     name = new Array(52).join('c');
  //     const res = await execute();
  //     expect(res.status).toBe(400);
  //   })

  //   it('should save the category if it is valid', async () => {
  //     await execute();
  //     const category = await Course.find({ name: 'dasturlash' });
  //     expect(category).not.toBeNull();
  //   })

  //   it('should return the category if it is valid', async () => {
  //     const res = await execute();
  //     expect(res.body).toHaveProperty('_id');
  //     expect(res.body).toHaveProperty('name', 'dasturlash');
  //   })
  // })

  // describe('PUT /:id', () => {
  //   let token;
  //   let name;

  //   const execute = async () => {
  //     return await request(server)
  //       .post('/api/courses')
  //       .set('x-auth-token', token)
  //       .send({ name });
  //   }

  //   beforeEach(() => {
  //     token = new User().generateAuthToken();
  //     name = 'dasturlash';
  //   })

  //   it('should return 404 if invalid id is given', async () => {
  //     const response = await request(server).get('/api/courses/123');
  //     expect(response.status).toBe(404);
  //   })

  //   it('should return a category if valid id is given', async () => {
  //     const category = new Course({ name: 'sun\'iy idrok' });
  //     await category.save();

  //     const response = await request(server).get('/api/courses/' + category._id);
  //     expect(response.status).toBe(200);
  //     expect(response.body).toHaveProperty('name', 'sun\'iy idrok');
  //   })

  //   it('should return 400 if category name is less than 3 characters', async () => {
  //     name = '12';
  //     const res = await execute();
  //     expect(res.status).toBe(400);
  //   })

  //   it('should return 400 if category name is more than 50 characters', async () => {
  //     name = new Array(52).join('c');
  //     const res = await execute();
  //     expect(res.status).toBe(400);
  //   })

  //   it('should save the category if it is valid', async () => {
  //     await execute();
  //     const category = await Course.find({ name: 'dasturlash' });
  //     expect(category).not.toBeNull();
  //   })

  //   it('should return the category if it is valid', async () => {
  //     const res = await execute();
  //     expect(res.body).toHaveProperty('_id');
  //     expect(res.body).toHaveProperty('name', 'dasturlash');
  //   })
  // })

  // describe('DELETE /:id', () => {
  //   let token;

  //   const execute = async () => {
  //     const categoryId = ObjectId();
  //     return await request(server)
  //       .delete('/api/courses/' + categoryId)
  //       .set('x-auth-token', token)
  //   }

  //   beforeEach(() => {
  //     token = new User().generateAuthToken();
  //   })

  //   it('should return 401 if user is not logged in', async () => {
  //     token = '';
  //     const res = await execute();
  //     expect(res.status).toBe(401);
  //   })

  //   it('should return 404 if invalid id is given', async () => {
  //     const response = await request(server).get('/api/courses/123');
  //     expect(response.status).toBe(404);
  //   })

  //   it('should return 404 if no category with the id exist', async () => {
  //     const categoryId = ObjectId();
  //     const response = await request(server).get('/api/courses/' + categoryId);
  //     expect(response.status).toBe(404);
  //   })

  //   it('should delete the category if it is valid', async () => {
  //     const res = await execute();
  //     const category = await Course.findOne({ _id: res._id });
  //     expect(category).toBeNull();
  //   })
  // })
})