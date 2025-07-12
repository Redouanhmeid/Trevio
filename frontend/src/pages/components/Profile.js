import React from 'react';
import { Layout, Row, Col, Typography, Card, Avatar, Badge, Rate } from 'antd';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';

const { Title, Text } = Typography;
const { Content } = Layout;

const Profile = () => {
 const userInfo = {
  name: 'Abid',
  photo: 'https://via.placeholder.com/80', // Replace with the user's photo URL
  rating: 4.87,
  reviews: 156,
  isSuperhost: true,
  verified: ['Identity', 'Email Address', 'Phone Number'],
  info: {
   school: 'Université Mohammed 5 RABAT',
   profession: 'Prof/retraité',
   passions: 'Se balader dans la ville de Rabat',
   breakfast: 'Thé marocain, huile d’olive & miel beurre',
   pets: 'Les chats',
   birthYear: 'Dans les années 60',
   hobbies: ['Le football', 'Les séries sur Netflix'],
   languages: ['Arabe', 'Anglais', 'Français'],
  },
  comments: [
   {
    user: 'Benyoucef',
    date: 'Novembre 2024',
    text:
     'Personne très agréable, cultivée et très attachante. Un très bon guide. Je le conseille les yeux fermés.',
   },
   {
    user: 'Vitalii',
    date: 'Novembre 2024',
    text:
     'Abid est un hôte très accueillant, à une belle maison confortable, et sert de délicieux petits déjeuners. Je recommande vivement !',
   },
  ],
  listings: [
   {
    title: 'Appartement en résidence',
    rating: 4.87,
    location: 'Rabat',
    image: 'https://via.placeholder.com/150',
   },
   {
    title: 'Chambre privée chez Abid',
    rating: 4.88,
    location: 'Rabat',
    image: 'https://via.placeholder.com/150',
   },
  ],
 };

 return (
  <Layout className="contentStyle">
   <Head />
   <Content className="container">
    <Row gutter={[16, 16]}>
     <Col xs={24} sm={8}>
      <Card className="custom-stat-card" bordered={false}>
       <Card.Meta
        avatar={
         <Avatar
          src="https://api.dicebear.com/7.x/miniavs/svg?seed=1"
          size={64}
         />
        }
        title="Card title"
        description={
         <>
          <p>This is the description</p>
          <p>This is the description</p>
         </>
        }
       />
      </Card>
     </Col>
     <Col xs={24} sm={14}></Col>
    </Row>
   </Content>
   <Foot />
  </Layout>
 );
};

export default Profile;
