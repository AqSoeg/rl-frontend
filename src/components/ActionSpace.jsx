import { Button } from 'antd'

const ActionSpace = () => {
  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <h2 className='text-xl font-bold mb-4'>动作空间</h2>
      <div className='flex flex-col gap-2'>
        {[...Array(10)].map((_, index) => (
          <Button key={index} type='primary' block>
            动作{index + 1} 行为规划
          </Button>
        ))}
      </div>
    </div>
  )
}

export default ActionSpace
