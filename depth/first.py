import glob
from keras.models import load_model
from utils import predict, load_images, display_images
from layers import BilinearUpSampling2D
from matplotlib import pyplot as plt


print('\n\nLoading model...')
custom_objects = {'BilinearUpSampling2D': BilinearUpSampling2D, 'depth_loss_function': None}
model = load_model('nyu.h5', custom_objects=custom_objects, compile=False)
print('Model loaded.')

print('\n\nLoading images...')
inputs = load_images(glob.glob('imgs/119_image.png'))
print('\nLoaded ({0}) images of size {1}.'.format(inputs.shape[0], inputs.shape[1:]))

print('\n\nPredicting...')
outputs = predict(model, inputs)

# Display results
print('\n\nDisplaying...')
viz = display_images(outputs.copy(), inputs.copy())
plt.figure(figsize=(10,5))
plt.imshow(viz)
plt.savefig('out.png')
plt.show()


# import tensorflow as tf
# tf.enable_eager_execution()
# from model import DepthEstimate

# model = DepthEstimate()
# checkpoint_path = "training_1/cp.ckpt"
# model.load_weights(checkpoint_path)

# print('Model weights loaded.')

