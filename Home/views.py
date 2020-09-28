from django.shortcuts import render
from django.http import JsonResponse
import base64
import os
import requests
from io import BytesIO
import json
import cv2
import numpy as np
from PIL import Image
from django.views.decorators.csrf import csrf_exempt
import matplotlib.pyplot as plt
import matplotlib as mpl
from Lungs_Scan.train_model import train as p


def home(request):
    args = {'title': 'Home | Scan.ai'}
    return render(request, 'home.html', args)



def team(request):
    args = {'title': 'Team | Scan.ai'}
    return render(request, 'team.html', args)

def game(request):
    return render(request,'game.html')

def validate_files(files):
    for file in files:
        image_extensions = ['ras', 'xwd', 'bmp', 'jpe', 'jpg', 'jpeg', 'xpm', 'ief', 'pbm', 'tif', 'gif', 'ppm', 'xbm',
                            'tiff', 'rgb', 'pgm', 'png', 'pnm']
        ext = file.name.split('.')
        ext = ext[len(ext) - 1]
        if ext.lower() not in image_extensions:
            return False
    return True



def img_to_results(file):

    classes = ['Normal', 'Pneumonia']
    img = p.image_loader(file)
    img, class_activation, pred = p.predict_img(img)
    pred = classes[pred.item()]
    try:
        name = file.name.split("/")
    except AttributeError:
        name = file.split("/")
    name = name[len(name) - 1].split(".")[0]

    prediction = {
        'name': name,
        'pred': pred,
    }

    mpl.use('Agg')
    plt.ioff()
    plt.axis('off')
    plt.imshow(class_activation, cmap='jet', alpha=1, aspect='equal')
    plt.imshow(img, alpha=0.55, aspect='equal')
    plt.title(name + ' - ' + pred)
    plt.tight_layout()
    fig = plt.gcf()
    # canvas = FigureCanvas(fig)
    buf = BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    string = base64.b64encode(buf.read())

    prediction['image'] = string.decode("utf-8")
    return prediction



@csrf_exempt
def upload_data(request):
    args = {'title': 'Live Scan | PneumoScan.ai'}
    if request.method == 'POST':
        files = request.FILES.getlist('files')
        print(files)
        if len(files) > 0:
            if not validate_files(files):
                args.update({'message': 'Please upload an appropriate image file',
                             "status": 0})
                return JsonResponse(args)

            images = []
            for i in range(len(files)):
                prediction = img_to_results(files[i])
                images.append(prediction)

            args.update({'message': 'Files are cool',
                         "images": images,
                         "status": 1,
                         })

            # return render(request, 'results.html', args)
            return JsonResponse(args)
        else:
            args.update({'message': 'Please provide all the details',
                         "status": 0})
            return JsonResponse(args)

    else:
        return render(request, 'home.html', args)

def send_mail(request):
    name = request.POST.get('name')
    email = request.POST.get('email')
    result = request.POST.get('report')
    report_result = result.upper()
    review = request.POST.get('review')
    from django.core.mail import send_mail
    send_mail('Name of Report is- '+name,
                                      '\n Report associated with this email address {{'+email+'}} is '+report_result+'. ' 
                                      '\n''\n'+review+
                                      '\n \n Greetings,\n Team Digital Report',
              'nepaldigital.report@gmail.com', [email],
              fail_silently=False)
    return render(request, 'home.html')