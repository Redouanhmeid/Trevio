import React, { useState, useMemo } from 'react';
import {
 Row,
 Col,
 Card,
 Divider,
 Typography,
 List,
 Flex,
 Grid,
 Space,
 Select,
 Badge,
 Tag,
 message,
} from 'antd';
import {
 ClockCircleOutlined,
 SyncOutlined,
 CheckCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from '../context/TranslationContext';
import useTask from '../hooks/useTask';
import useProperty from '../hooks/useProperty';

const { Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

export const TasksSection = React.memo(
 ({ userId, tasks, error, onStatusUpdate }) => {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const { updateTaskStatus } = useTask();
  const [loadingStates, setLoadingStates] = useState({});
  console.log(tasks);

  const getPriorityTag = (priority) => {
   const colors = {
    high: 'red',
    medium: 'orange',
    low: 'green',
   };
   const priorityInFrench = {
    high: t('tasks.priority.high'),
    medium: t('tasks.priority.medium'),
    low: t('tasks.priority.low'),
   };
   return (
    <Text style={{ color: colors[priority] }}>
     {priorityInFrench[priority]} <Badge color={colors[priority]} />
    </Text>
   );
  };

  const StatusSelect = ({ status, taskId, onStatusChange }) => {
   return (
    <Select
     value={status}
     onChange={(value) => onStatusChange(taskId, value)}
     loading={loadingStates[taskId]}
     style={{ width: 150 }}
     popupMatchSelectWidth={false}
    >
     <Option value="pending">
      <Space>
       <ClockCircleOutlined style={{ color: '#faad14' }} />
       {t('tasks.status.pending')}
      </Space>
     </Option>
     <Option value="in_progress">
      <Space>
       <SyncOutlined spin style={{ color: '#6D5FFA' }} />
       {t('tasks.status.inProgress')}
      </Space>
     </Option>
     <Option value="completed">
      <Space>
       <CheckCircleOutlined style={{ color: '#52c41a' }} />
       {t('tasks.status.completed')}
      </Space>
     </Option>
    </Select>
   );
  };

  const handleStatusChange = async (taskId, newStatus) => {
   try {
    setLoadingStates((prev) => ({ ...prev, [taskId]: true }));
    await updateTaskStatus(taskId, newStatus);
    await onStatusUpdate();
    message.success(t('tasks.message.statusUpdateSuccess'));
   } catch (error) {
    message.error(t('tasks.message.statusUpdateError'));
    console.error('Error updating task status:', error);
   } finally {
    setLoadingStates((prev) => ({ ...prev, [taskId]: false }));
   }
  };

  return (
   <Row gutter={[32, 32]}>
    <Col xs={24}>
     <Card
      title={
       <>
        {t('tasks.title')}
        {'  '}
        <i className="PrimaryColor fa-regular fa-thumbtack" />
        <br />
        <Divider />
       </>
      }
      className="dash-card"
     >
      {error && <Text type="danger">{t('error.tasksLoad')}</Text>}
      <List
       itemLayout="horizontal"
       dataSource={tasks}
       renderItem={(task) => (
        <List.Item
         extra={
          <StatusSelect
           status={task.status}
           taskId={task.id}
           onStatusChange={handleStatusChange}
          />
         }
        >
         <List.Item.Meta
          title={
           <Flex justify="flex-start" align="center" gap="middle">
            {getPriorityTag(task.priority)}
            {task?.property.name}
           </Flex>
          }
          description={
           <Space direction="vertical" size="small">
            <Flex vertical={screens.xs} gap="small">
             <Text className="PrimaryColor" strong>
              <Badge color="#6D5FFA" /> {task.title}
             </Text>
             {task.notes && <Text type="secondary">| {task.notes}</Text>}
            </Flex>
            <Tag
             color="#6D5FFA"
             icon={
              <i
               className="fa-regular fa-calendar"
               style={{ marginRight: 6 }}
              />
             }
            >
             {task.dueDate.split('T')[0]}
            </Tag>
           </Space>
          }
         />
        </List.Item>
       )}
      />
     </Card>
    </Col>
   </Row>
  );
 }
);
