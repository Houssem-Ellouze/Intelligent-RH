package tn.esprit.recrutement.config;

import feign.Response;
import feign.codec.ErrorDecoder;

public class CustomFeignErrorDecoder implements ErrorDecoder {

    private final ErrorDecoder defaultErrorDecoder = new Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        switch (response.status()) {
            case 404:
                return new feign.FeignException.NotFound(
                        "Ressource introuvable dans le service distant",
                        response.request(),
                        null,
                        null
                );
            case 503:
                return new RuntimeException("Service temporairement indisponible");
            default:
                return defaultErrorDecoder.decode(methodKey, response);
        }
    }
}