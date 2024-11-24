import { Select } from 'antd'

const { Option } = Select

const StateVector = () => {
  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <h2 className='text-xl font-bold mb-4'>状态向量</h2>
      <div className='grid grid-cols-5 gap-2'>
        {[...Array(10)].map((_, index) => (
          <Select
            key={index}
            placeholder={`状态选项${index + 1}`}
            className='w-full'
          >
            <Option value='1'>状态1</Option>
            <Option value='2'>状态2</Option>
          </Select>
        ))}
      </div>
    </div>
  )
}

export default StateVector
